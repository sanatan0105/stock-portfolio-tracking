let TradeHelper = require('../../controller/TradeHelper');
let assert = require('assert');
let chai = require('chai');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let should = chai.should();
const expect = chai.expect;

const SecurityModel = require('../../model/SecurityModel');
const PortfolioModel = require('../../model/PortfolioModel');

describe('#Test cases for getCurrentPriceOfSecurity of TradeHelper Module', () => {
    it('Should return 100', () => {
        let currentPrice = TradeHelper.getCurrentPriceOfSecurity('TCS');
        currentPrice.should.equal(100);
    })
});

describe('#Test cases for getNewAverageBuyPrice of TradeHelper Module', () => {
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

describe('#Test cases for createTradeObj of TradeHelper Module', () => {
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

describe('#Test cases for createNewPortfolio of TradeHelper Module', () => {
    let securityId, buyPrice = 400, numberOfShare = 5;
    let newPortfolio;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                // create a security
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                securityId = saveResult._id;
                newPortfolio = await TradeHelper.createNewPortfolio(securityId, buyPrice, numberOfShare);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should be an instance of PortfolioModel', async () => {
        let inst = newPortfolio instanceof PortfolioModel;
        inst.should.equal(true);
    });

    it('Should have a key numberOfShares with a value which is passed as argument', () => {
        expect(newPortfolio).to.have.property('numberOfShares');
        newPortfolio.numberOfShares.should.equal(numberOfShare);
    });

    it('Should have a key averageBuyPrice with a value which is passed as argument', () => {
        expect(newPortfolio).to.have.property('averageBuyPrice');
        newPortfolio.averageBuyPrice.should.equal(buyPrice);
    });

    it('Should have a key security', () => {
        expect(newPortfolio).to.have.property('security');
        newPortfolio.security.should.equal(securityId);
    });

    it('Should have a key _id', () => {
        expect(newPortfolio).to.have.property('_id');
    });

    // trade test cases
    it('Should have a key trade with datatype as array', () => {
        expect(newPortfolio).to.have.property('trade');
        newPortfolio.trade.should.be.a('array');
    });

    it('Trade object should have keys as tradeId', () => {
        expect(newPortfolio.trade[0]).to.have.property('tradeId');
    });

    it('Trade object should have price key and value should be equal to price in the argument', () => {
        expect(newPortfolio.trade[0]).to.have.property('price');
        newPortfolio.trade[0].price.should.equal(buyPrice);
    });

    it('Trade object should have buyOrSell key and value should be equal buy', () => {
        expect(newPortfolio.trade[0]).to.have.property('buyOrSell');
        newPortfolio.trade[0].buyOrSell.should.equal('buy');
    });

    it('Trade object should have dateOfPurchase key', () => {
        expect(newPortfolio.trade[0]).to.have.property('dateOfPurchase');
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for validateTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    /**
     * As we have validated all the InputValidator,
     * so we need to only test the valid input type
     * **/

    it('Should return a failed status, for unknown security symbol', async ()=>{
        let result = await TradeHelper.validateTrade('ABC', 4,false);
        result.status.should.equal('failed');
    });

    it('Should return a success object if valid known symbol is passed', async ()=>{
        let newSecurity = new SecurityModel({
            companyName: 'Tata Consultancy Services Limited (TCS)',
            ticketSymbol: 'TCS',
            sharePrice: 1843.45,
        });
        let saveResult = await newSecurity.save();
        let result = await TradeHelper.validateTrade('TCS', 4,true, 100);
        result.status.should.equal('success');
        let inst = (result.securityObj instanceof SecurityModel);
        inst.should.equal(true);
    });


    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for CalculateReturn of TradeHelper Module', () => {
    it('Should return a valid return', ()=>{
        let portfolioObj = [
            {
                security: {ticketSymbol: 'TCS'},
                averageBuyPrice: 500,
                numberOfShares: 5
            },
            {
                security: {ticketSymbol: 'ABC'},
                averageBuyPrice: 500,
                numberOfShares: 5
            }
        ];

        let result = TradeHelper.CalculateReturn(portfolioObj);
        let totalReturn = 0;
        portfolioObj.forEach(portfolio => {
            let currentPrice = TradeHelper.getCurrentPriceOfSecurity(portfolio.security.ticketSymbol);
            let singlePortfolioReturn = (currentPrice - portfolio.averageBuyPrice) / portfolio.numberOfShares;
            totalReturn += singlePortfolioReturn;
        });

        result.should.equal(totalReturn);
    })

    // we are assuming a valid portfolio will be passed in this method
});

describe('#Test cases for GetHolding of TradeHelper Module', () => {
    // create security
    // create portfolio
    let newPortfolio;
    let totalShares = 0;
    let totalSecurities = 0;
    let averageSharePrice = 0;
    let averagePrice = 0;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                await TradeHelper.createNewPortfolio(saveResult._id, 500, 5);
                newPortfolio = await PortfolioModel.find().select('averageBuyPrice numberOfShares');
                newPortfolio.forEach(portfolio => {
                    totalSecurities += 1;
                    totalShares += portfolio.numberOfShares;
                    averageSharePrice += portfolio.averageBuyPrice
                });

                averagePrice = averageSharePrice / totalShares;
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return the correct holding', async ()=>{
        let ret = await TradeHelper.GetHolding();
        ret.status.should.equal('success');
        ret.message.totalSecurities.should.equal(totalSecurities);
        // ret.message.averagePrice.should.equal(averagePrice);
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for GetReturn of TradeHelper Module', () => {
    let totalReturn;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                await TradeHelper.createNewPortfolio(saveResult._id, 500, 5);
                let portfolio = await PortfolioModel.find()
                    .select('averageBuyPrice numberOfShares security')
                    .populate('security', 'ticketSymbol sharePrice');
                totalReturn = TradeHelper.CalculateReturn(portfolio);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return the calculated return', async ()=>{
        let ret = await TradeHelper.GetReturn();
        ret.status.should.equal('success');
        ret.message.should.equal(totalReturn);
    });


    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for GetPortfolio of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                let id = await TradeHelper.BuyTrade('TCS', 500, 5);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return a sucess message and the message object', async ()=>{
        let ret = await TradeHelper.GetPortfolio();
        let inst = ret.message instanceof PortfolioModel;
        ret.status.should.equal('success');
        ret.message.should.be.a('array')

    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for SellTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return a success response', async ()=>{
        let ret = await TradeHelper.BuyTrade('TCS', 400,4);
        ret.status.should.equal('success');
        ret.message.should.equal('trade purchased');

    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

describe('#Test cases for BuyTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                let ret = await TradeHelper.BuyTrade('TCS', 400,4);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return a failed response as number of share purchased exceeded the share available', async ()=>{
        let ret = await TradeHelper.SellTrade('TCS', 5);
        ret.type.should.equal('error');
        ret.message.should.equal('not enough share to sell');
    });

    it('Should return a success response', async ()=>{
        let ret = await TradeHelper.SellTrade('TCS', 3);
        ret.status.should.equal('success');
        ret.message.should.equal('trade sold');
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});