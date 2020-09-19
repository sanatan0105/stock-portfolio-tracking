const ErrorHandler = require("../lib/ErrorHandler");
const InputValidator = require('../lib/InputValidator');
const SecurityModel = require('../model/SecurityModel');
const PortfolioModel = require('../model/PortfolioModel');
const CommonMethod = require('../lib/CommonMethods');
const Winston = require('../config/Winston');
const mongoose = require('mongoose');
const CURRENT_PRICE = 100;

module.exports = {
    BuyTrade: async (symbol, sharePrice, numberOfShares) => {
        try {
            /**
             * This method is used to buy trade
             * Steps:
             * 1. Validation of input is done with the validateTrade method
             * 2. validateTrade returns the securityObj is the input is validated
             * 3. Check if the security is present in the portfolio or not with the security id returned from validateTrade
             * 4. if new to portfolio
             *      create new portfolio entry
             * 5. else
             *      update the portfolio with the new average buying price and number of shares
             * 6. Insert the trade in the portfolio object
             * 7. return the success object
             * @augments:
             * 1. symbol: Security symbol
             * 2. sharePrice: buying price of the share
             * 3. numberOfShares: number of share involved in the buying process
             * @return: if any error is there then failed object will be returned else success response with portfolio
             *          object
             * **/

                // validation
            let validationResult = await module.exports.validateTrade(symbol, numberOfShares, true, sharePrice);
            if (validationResult.status === 'failed')
                return ErrorHandler.userDefinedError(400, validationResult.message);
            if (validationResult.status === 'failedInCatch')
                return ErrorHandler.parseError(validationResult.message);

            let securityObj = validationResult.securityObj;
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
            /**
             * This method is used to sell trade
             * Steps:
             * 1. Validation of input is done with the validateTrade method
             * 2. validateTrade returns the securityObj is the input is validated
             * 3. Check if the security is present in the portfolio or not with the security id returned from validateTrade
             * 4. if new to portfolio
             *      return error with message security not found in the portfolio
             * 5. else
             *      update the portfolio with the decreased number of shares
             * 6. Insert the trade in the portfolio object
             * 7. return the success object
             * @augments:
             * 1. symbol: Security symbol
             * 2. numberOfShares: number of share involved in the buying process
             * @return: if any error is there then failed object will be returned else success response with portfolio
             *          object
             * **/
            let validationResult = await module.exports.validateTrade(symbol, numberOfShares, false);
            if (validationResult.status === 'failed')
                return ErrorHandler.userDefinedError(400, validationResult.message);
            if (validationResult.status === 'failedInCatch')
                return ErrorHandler.parseError(validationResult.message);

            let securityObj = validationResult.securityObj;
            let portfolioObj = await PortfolioModel.findOne({security: securityObj._id});

            if (!portfolioObj)
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

    RemoveTrade: async (tradeId) => {
        try {
            tradeId = mongoose.Types.ObjectId(tradeId);
            let tradeDetails = await PortfolioModel.findOne({'trade.tradeId': tradeId});
            let updatedPriceAndShares = module.exports.getPriceAndShareFromTrades(tradeDetails.trade, [tradeId.toString()]);
            tradeDetails.numberOfShares = updatedPriceAndShares.updatedShares;
            tradeDetails.averageBuyPrice = updatedPriceAndShares.updatedPrice;
            tradeDetails.trade = updatedPriceAndShares.sortedTradeObjects;
            await tradeDetails.save();
            return tradeDetails;
        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    UpdateTrade: async (tradeId, attributes) => {
        try {
            tradeId = mongoose.Types.ObjectId(tradeId);
            if (!tradeId || !attributes)
                return ErrorHandler.userDefinedError(400, 'tradeId and attributes are required');

            let tradeDetails = await PortfolioModel.findOne({'trade.tradeId': tradeId}).populate('security', 'ticketSymbol');
            if (!tradeDetails)
                return ErrorHandler.userDefinedError(400, 'no record found with this tradeId');

            let tradeObj = module.exports.getTradeObjFromPortfolioObj(tradeId, tradeDetails);
            console.log(tradeObj);
            let buyOrSell = tradeObj.buyOrSell;
            let symbol, sharePrice, numberOfShares;
            if ('symbol' in attributes) {
                symbol = attributes['symbol'].toUpperCase();
                let securityObj = await SecurityModel.findOne({ticketSymbol: symbol});
                if (!securityObj)
                    return ErrorHandler.userDefinedError(400, 'invalid security name passed');
            } else {
                symbol = tradeDetails.security.ticketSymbol;
            }

            if ('sharePrice' in attributes) {
                sharePrice = attributes['sharePrice'];
                let validatePrice = InputValidator.ValidateSharePrice(sharePrice);
                if (validatePrice.status === 'failed')
                    return ErrorHandler.userDefinedError(400, validatePrice.message);
                if (validatePrice.status === 'failedInCatch')
                    return ErrorHandler.parseError(validatePrice.message);
            } else {
                sharePrice = tradeObj.price;
            }

            if ('numberOfShares' in attributes) {
                numberOfShares = attributes['numberOfShares'];
                let validatePrice = InputValidator.ValidateQuantity(numberOfShares);
                if (!validatePrice)
                    return ErrorHandler.userDefinedError(400, 'invalid number of shared passed');
            } else {
                numberOfShares = tradeObj.numberOfShares;
            }
            await module.exports.RemoveTrade(tradeId);
            let ret;
            if(buyOrSell === 'buy') {

                ret = await module.exports.BuyTrade(symbol, sharePrice, numberOfShares);
            } else if(buyOrSell === 'sell') {

                ret = await module.exports.SellTrade(symbol, numberOfShares);
            }
            ret.message = 'attribute updated';
            return ret;
        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    GetPortfolio: async () => {
        try {
            /**
             * This method is used to get all securities in portfolio of the user
             * @augments: null
             * @return: portfolio list with security details
             * **/
            let portfolio = await PortfolioModel.find().populate('security', 'ticketSymbol sharePrice');

            return {status: 'success', message: portfolio}
        } catch (e) {
            return ErrorHandler.parseError(e);
        }
    },

    GetReturn: async () => {
        try {
            /**
             * This method is used to get the total return at any point of time
             * @augments: null
             * @return: an success object with total return key
             * **/
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
            /**
             * This method is used to get the holdings
             * @augments: null
             * @return: returns the success response with totalSecurities, totalShares and averagePrice
             * **/
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
            /**
             * This method is used to calculate the return from the portfolio at any point of time
             * @augments: portfolio object
             * @return: the total return
             * **/
            let totalReturn = 0;
            portfolioObj.forEach(portfolio => {
                let currentPrice = module.exports.getCurrentPriceOfSecurity(portfolio.security.ticketSymbol);
                let singlePortfolioReturn = (currentPrice - portfolio.averageBuyPrice) / portfolio.numberOfShares;
                totalReturn += singlePortfolioReturn;
            });

            return totalReturn;
        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    getPriceAndShareFromTrades: (tradeObjs, escapeTradeId = []) => {
        try {
            let updatedPrice = 0;
            let updatedShares = 0;
            let sortedTradeObjects = tradeObjs.sort((a, b) => a.dateOfPurchase - b.dateOfPurchase);
            sortedTradeObjects.forEach((trade, i) => {
                if (!escapeTradeId.includes(trade.tradeId.toString())) {
                    if (trade.buyOrSell === 'buy') {
                        updatedPrice = module.exports.getNewAverageBuyPrice(updatedPrice, updatedShares, trade.price, trade.numberOfShares);
                        updatedShares += trade.numberOfShares;
                    } else if (trade.buyOrSell === 'sell') {
                        updatedShares -= trade.numberOfShares;
                    }
                } else {
                    sortedTradeObjects.splice(i, 1);
                }
            });

            return {updatedPrice, updatedShares, sortedTradeObjects};

        } catch (e) {
            return {status: 'failedInCatch', message: e};
        }
    },

    getTradeObjFromPortfolioObj: (tradeId, portfolio) => {
        // console.log(tradeId);
        // console.log(portfolio);
        let tradeObj = null;
        portfolio.trade.forEach(tradeItem => {
            console.log(tradeItem.tradeId.toString() === tradeId.toString());
            if (tradeItem.tradeId.toString() === tradeId.toString()) {
                tradeObj = tradeItem;
            }
        });
        return tradeObj;
    },

    validateTrade: async (symbol, numberOfShares, shouldValidatePrice, sharePrice = 0) => {
        try {
            /**
             * This method is used to validate the trade input
             * @augments:
             * 1. symbol: Security symbol
             * 2. numberOfShares: number of share involved in the buying process
             * 3. shouldValidatePrice: should the code validate price or not (true or false), in case of selling we
             *      don't need to validate the price, as we are selling at the average price, so we don't need the price
             * 4. sharePrice: buying price of the share
             *
             * Steps:
             * 1. Using InputValidator validates
             *      1.1: sharePrice
             *      1.2: numberOfShares
             *      1.3: symbol
             *      If failed, return the failed object with failure message
             * 2. find the security object in the collection using upper cased symbol
             * 3. if not found, return false
             * 4. else return success object with security object
             * @return: failed object with message in case of validation error, else success object with security object
             * **/
            if (shouldValidatePrice) {
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
        /**
         * This method is used to return un committed portfolio object
         * @augments:
         * 1. securityId: the _id of the security document
         * 2. buyPrice: the buying price of the trade
         * 3. numberOfShare: number of shares involved in the process
         *
         * Steps:
         * 1. We are considering the input to be validated here,
         * 2. Create a new trade object using createTradeObj method
         * 3. return the new PortfolioModel object
         * @return: new unsaved PortfolioModel object
         * **/
        let tradeObj = module.exports.createTradeObj(buyPrice, numberOfShare, 'buy');
        return new PortfolioModel({
            security: securityId,
            averageBuyPrice: buyPrice,
            numberOfShares: numberOfShare,
            trade: [tradeObj]
        })
    },

    createTradeObj: (price, numberOfShare, buyOrSell) => {
        /**
         * This method is used to generate a trade object
         * @augments:
         * 1. price: price involved in the trade
         * 2. numberOfShare: number of shared involved in the share
         * 3. buyOrSell: is this trade for buying or selling
         * @return: return the trade object
         * **/
        return {
            tradeId: CommonMethod.generateId(),
            price: price,
            numberOfShares: numberOfShare,
            buyOrSell: buyOrSell,
            dateOfPurchase: new Date()
        }
    },

    getNewAverageBuyPrice: (oldAvgPrice, oldNumberOfShares, newSharePrice, newNumberOfShares) => {
        /**
         * This method is used to calculate the new new average buying price after the trade is bought at different price
         * @augments:
         * 1. oldAvgPrice
         * 2. oldNumberOfShares
         * 3. newSharePrice
         * 4. newNumberOfShares
         *
         * Steps:
         * Use below formula to calculate the new average buying price
         * SUM((CURRENT_PRICE[ticker] - AVERAGE_BUY_PRICE[ticker]) *CURRENT_QUANTITY[ticker])
         * @return: updated average buying price
         * **/
        console.log();

        return (oldAvgPrice * oldNumberOfShares + newNumberOfShares * newSharePrice) / (oldNumberOfShares + newNumberOfShares)
    },

    getCurrentPriceOfSecurity: (securitySymbol) => {
        /**
         * This method is used to get the current price of security
         * @augments: securitySymbol
         * As we don't have the api to get the current share price of the security, we will return a fix number
         * @return: a fix number
         * **/
        Winston.info(`Fetching current price for the security with symbol: ${securitySymbol}`);
        return CURRENT_PRICE;
    },
};