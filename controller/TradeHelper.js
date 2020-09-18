const ErrorHandler = require("../lib/ErrorHandler");
const InputValidator = require('../lib/InputValidator');
const SecurityModel = require('../model/SecurityModel');
const PortfolioModel = require('../model/PortfolioModel');
const CommonMethod = require('../lib/CommonMethods');
const Winston = require('../config/Winston');

const CURRENT_PRICE = 100;

module.exports = {
    BuyTrade: async (symbol, sharePrice, numberOfShares) => {
        try {
            let validationResult = await module.exports.validateTrade(symbol, numberOfShares, true, sharePrice);
            if (validationResult.status === 'failed')
                return ErrorHandler.userDefinedError(400, validationResult.message);
            if (validationResult.status === 'failedInCatch')
                return ErrorHandler.parseError(validationResult.message);
            let securityObj =  validationResult.securityObj;
            let portfolioObj = await PortfolioModel.findOne({security: securityObj._id});
            if (!portfolioObj) {
                // create new portfolio
                portfolioObj = module.exports.createNewPortfolio(securityObj._id, sharePrice, numberOfShares);
                await portfolioObj.save();
            } else {
                let newTradeObj = module.exports.createTradeObj(sharePrice, numberOfShares, 'buy');
                let newAvgSharePrice = module.exports.getNewAverageBuyPrice(
                    portfolioObj.averageBuyPrice, portfolioObj.numberOfShares, sharePrice, numberOfShares);
                let updatedNumberOfShares = portfolioObj.numberOfShares + numberOfShares;
                portfolioObj.averageBuyPrice = newAvgSharePrice;
                portfolioObj.numberOfShares = updatedNumberOfShares;
                portfolioObj.trade.push(newTradeObj);
                await portfolioObj.save();
            }
            return {status: 'success', message: 'trade purchased', other: portfolioObj}
        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    SellTrade: async (symbol, numberOfShares) => {
        try {
            let validationResult = await module.exports.validateTrade(symbol, numberOfShares, false);
            if (validationResult.status === 'failed')
                return ErrorHandler.userDefinedError(400, validationResult.message);
            if (validationResult.status === 'failedInCatch')
                return ErrorHandler.parseError(validationResult.message);
            let securityObj =  validationResult.securityObj;
            let portfolioObj = await PortfolioModel.findOne({security: securityObj._id});

            if(!portfolioObj)
                return ErrorHandler.userDefinedError(400, 'security not found in the portfolio');

            if (portfolioObj.numberOfShares < numberOfShares)
                return ErrorHandler.userDefinedError(400, 'not enough share to sell');

            let newTradeObj = module.exports.createTradeObj(portfolioObj.averageBuyPrice, numberOfShares, 'sell');
            portfolioObj.trade.push(newTradeObj);
            portfolioObj.numberOfShares = portfolioObj.numberOfShares - numberOfShares;
            await portfolioObj.save();
            return {status: 'success', message: 'trade sold', other: portfolioObj}

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    GetPortfolio: async () => {
        try {
            let portfolio = await PortfolioModel.find().populate('security', 'ticketSymbol sharePrice');

            return {status: 'success', message: portfolio}
        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    GetReturn: async () => {
        try {
            let portfolio = await PortfolioModel.find()
                .select('averageBuyPrice numberOfShares security')
                .populate('security', 'ticketSymbol sharePrice');
            let totalReturn = module.exports.CalculateReturn(portfolio);
            return {status: 'success', message: totalReturn};

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    GetHolding: async () => {
        try {
            let portfolioObj = await PortfolioModel.find().select('averageBuyPrice numberOfShares');
            let totalShares = 0;
            let totalSecurities = 0;
            let averageSharePrice = 0;

            portfolioObj.forEach(portfolio => {
                totalSecurities += 1;
                totalShares += portfolio.numberOfShares;
                averageSharePrice += portfolio.averageBuyPrice
            });

            let averagePrice = averageSharePrice / totalShares;

            return {
                status: 'success',
                message: {totalSecurities: totalSecurities, totalShares: totalShares, averagePrice: averagePrice}
            };

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    CalculateReturn: (portfolioObj) => {
        try {
            let totalReturn = 0;
            portfolioObj.forEach(portfolio => {
                let currentPrice = module.exports.getCurrentPriceOfSecurity(portfolio.security.ticketSymbol);
                let singlePortfolioReturn = (currentPrice - portfolio.averageBuyPrice) / portfolio.numberOfShares;
                totalReturn += singlePortfolioReturn;
                // (1843.45 - 1833.45) * 5 + (329.25 - 319.25) * 5 + (535.00 - 438.57) * 7 = Rs. 775.01.
            });

            return totalReturn;
        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    validateTrade: async (symbol, numberOfShares, shouldValidatePrice, sharePrice = 0) => {
        try {
            if(shouldValidatePrice){
                let _validateSharePrice = InputValidator.ValidateSharePrice(sharePrice);
                if (_validateSharePrice.status === 'failed' || _validateSharePrice.status === 'failedInCatch')
                    return _validateSharePrice;
            }
            if (!InputValidator.ValidateQuantity(numberOfShares))
                return {status: 'failed', message: 'invalid number of shares. Only positive numbers are allowed'};
            let _validateSymbol = InputValidator.ValidateTicketSymbol(symbol);
            if (_validateSymbol.status === 'failed' || _validateSymbol.status === 'failedInCatch')
                return _validateSymbol;

            symbol = symbol.toUpperCase();
            let securityObj = await SecurityModel.findOne({ticketSymbol: symbol});
            if (!securityObj)
                return {status: 'failed', message: `Security with symbol ${symbol} not found in the record`};

            return {status: 'success', message: 'object verified', securityObj};


        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    createNewPortfolio: (securityId, buyPrice, numberOfShare) => {
        let tradeObj = module.exports.createTradeObj(buyPrice, numberOfShare, 'buy');
        return new PortfolioModel({
            security: securityId,
            averageBuyPrice: buyPrice,
            numberOfShares: numberOfShare,
            trade: [tradeObj]
        })
    },

    createTradeObj: (price, numberOfShare, buyOrSell) => {
        return {
            tradeId: CommonMethod.generateId(),
            price: price,
            numberOfShares: numberOfShare,
            buyOrSell: buyOrSell,
            dateOfPurchase: new Date()
        }
    },

    getNewAverageBuyPrice: (oldAvgPrice, oldNumberOfShares, newSharePrice, newNumberOfShares) => {
        return (oldAvgPrice * oldNumberOfShares + newNumberOfShares * newSharePrice) / (oldNumberOfShares + newNumberOfShares)
    },

    getCurrentPriceOfSecurity: (securitySymbol) => {
        Winston.info(`Fetching current price for the security with symbol: ${securitySymbol}`);
        return CURRENT_PRICE;
    },
};