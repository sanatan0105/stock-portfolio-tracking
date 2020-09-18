let TradeHelper = require('../../controller/TradeHelper');
let assert = require('assert');
let chai = require('chai');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let should = chai.should();

describe('Test cases for getCurrentPriceOfSecurity of TradeHelper Module', () => {
    it('Should return 100', () => {
        let currentPrice = TradeHelper.getCurrentPriceOfSecurity('TCS');
        currentPrice.should.equal(100);
    })
});

describe('Test cases for getNewAverageBuyPrice of TradeHelper Module', () => {
    it('Should return the new average price', () => {
        // (535*2 + 400*5)/(5 + 2)

        let oldAvgPrice = 535;
        let oldNumberOfShares = 2;
        let newSharePrice = 400;
        let newNumberOfShares = 5;
        let newAverage = (oldAvgPrice * oldNumberOfShares + newNumberOfShares * newSharePrice) / (oldNumberOfShares + newNumberOfShares);
        let getAverage = TradeHelper.getNewAverageBuyPrice(oldAvgPrice, oldNumberOfShares, newSharePrice, newNumberOfShares);
        getAverage.should.equal(newAverage);
    })
});

describe('Test cases for createTradeObj of TradeHelper Module', () => {
    let price = 10, numberOfShare = 10, buyOrSell = 'buy';
    let tradeObject = TradeHelper.createTradeObj(price, numberOfShare, buyOrSell);

    it('Should return an object datatype', () => {
        tradeObject.should.be.a('object');
    });

    it('Should return a valid trade id', () => {
        tradeObject.tradeId.should.be.a('object');
    });

    it('Should be a valid mongo id', () => {
        let a = mongoose.isValidObjectId(tradeObject.tradeId.toString());
        a.should.equal(true);
    });

    it('Should return exactly the same price which is sent as argument', () => {
        tradeObject.price.should.equal(price);
    });

    it('Should return exactly the same numberOfShare which is sent as argument', () => {
        tradeObject.numberOfShares.should.equal(numberOfShare);
    });

    it('Should return exactly the same buyOrSell which is sent as argument', () => {
        tradeObject.buyOrSell.should.equal(buyOrSell);
    });

    it('Should return an time object for dateOfPurchase key', () => {
        let time = new Date();
        let timeReturn = tradeObject.dateOfPurchase;
        let timeCompareResult = timeReturn < time;
        timeCompareResult.should.equal(true);
        timeCompareResult = (time - timeReturn) < 5000;
        timeCompareResult.should.equal(true);
    });
});

// TODO: Write test cases for createNewPortfolio

describe('Test cases for createTradeObj of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', () => {
                done();
            })
            .on('error', error =>{
                console.log(error);
            });
    });
    it('Should return failed object if invalid sharePrice is sent', async () => {
        let result = await TradeHelper.validateTrade('TCS', 5, true, null);
        result.status.should.equal('failed');
        result = await TradeHelper.validateTrade('TCS', 5, true, '');
        result.status.should.equal('failed');
        result = await TradeHelper.validateTrade('TCS', 5, true, '123');
        result.status.should.equal('failed');
        result = await TradeHelper.validateTrade('TCS', 5, true, 20);
        console.log(result);
        result.status.should.equal('failed');

    });
    // it('Should return failed object if invalid number of shares in send');
    // it('Should return failed object if invalid ticketSymbol is sent');

});

