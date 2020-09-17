const ErrorHandler = require("../lib/ErrorHandler");
const InputValidator = require('../lib/InputValidator');
// const Config = require('../config/config');
const SecurityModel = require('../model/SecurityModel');
const PortfolioModel = require('../model/PortfolioModel');
const CommonMethod = require('../lib/CommonMethods');
const Winston = require('../config/Winston');

const CURRENT_PRICE = 100;

module.exports = {

    PlaceTrade: async (symbol, sharePrice, numberOfShares) => {
        try {
            // validate the input
            let _validateSharePrice = InputValidator.ValidateSharePrice(sharePrice);
            if (_validateSharePrice.status === 'failed')
                return ErrorHandler.userDefinedError(400, _validateSharePrice.message);
            if (_validateSharePrice.status === 'failedInCatch')
                return ErrorHandler.parseError(_validateSharePrice.message);

            if (!InputValidator.ValidateQuantity(numberOfShares))
                return ErrorHandler.userDefinedError(400, 'invalid number of shares. Only positive numbers are allowed');

            let _validateSymbol = InputValidator.ValidateTicketSymbol(symbol);
            if (_validateSymbol.status === 'failed')
                return ErrorHandler.userDefinedError(400, _validateSymbol.message);
            if (_validateSymbol.status === 'failedInCatch')
                return ErrorHandler.parseError(_validateSymbol.message);

            symbol = symbol.toUpperCase();
            let securityObj = await SecurityModel.findOne({ticketSymbol: symbol});
            if (!securityObj)
                return ErrorHandler.userDefinedError(400, `Security with symbol ${symbol} not found in the record`);

            let portfolioObj = await PortfolioModel.findOne({security: securityObj._id});
            if (!portfolioObj) {
                // create new portfolio
                portfolioObj = module.exports.createNewPortfolio(securityObj._id, sharePrice, numberOfShares);
                await portfolioObj.save();
            } else {
                let newTradeObj = module.exports.createTradeObj(sharePrice, numberOfShares);
                let newAvgSharePrice = module.exports.getNewAverageBuyPrice(
                    portfolioObj.averageBuyPrice, portfolioObj.numberOfShares, sharePrice, numberOfShares);
                let updatedNumberOfShares = portfolioObj.numberOfShares + numberOfShares;
                portfolioObj.averageBuyPrice = newAvgSharePrice;
                portfolioObj.numberOfShares = updatedNumberOfShares;
                portfolioObj.trade.push(newTradeObj);
                await portfolioObj.save();
            }
            return {status: 'success', message: 'trade added', other: portfolioObj}
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
            let totalReturn  = module.exports.CalculateReturn(portfolio);
            return {status: 'success', message: totalReturn};

        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    createNewPortfolio: (securityId, buyPrice, numberOfShare) => {
        let tradeObj = module.exports.createTradeObj(buyPrice, numberOfShare);
        return new PortfolioModel({
            security: securityId,
            averageBuyPrice: buyPrice,
            numberOfShares: numberOfShare,
            trade: [tradeObj]
        })
    },

    createTradeObj: (buyPrice, numberOfShare) => {
        return {
            tradeId: CommonMethod.generateId(),
            buyPrice: buyPrice,
            numberOfShares: numberOfShare,
            dateOfPurchase: new Date()
        }
    },

    getNewAverageBuyPrice: (oldAvgPrice, oldNumberOfShares, newSharePrice, newNumberOfShares) => {
        return (oldAvgPrice * oldNumberOfShares + newNumberOfShares * newSharePrice) / (oldNumberOfShares + newNumberOfShares)
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

    getCurrentPriceOfSecurity: (securitySymbol) => {
        Winston.info(`Fetching current price for the security with symbol: ${securitySymbol}`);
        return CURRENT_PRICE;
    },
};