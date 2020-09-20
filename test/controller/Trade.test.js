let TradeHelper = require('../../controller/TradeHelper');
let assert = require('assert');
let chai = require('chai');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let should = chai.should();
const expect = chai.expect;

const SecurityModel = require('../../model/SecurityModel');
const PortfolioModel = require('../../model/PortfolioModel');
const CommonMethod = require('../../lib/CommonMethods');

describe('#Test cases for BuyTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                let ret = await TradeHelper.BuyTrade('TCS', 400, 4);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return error object if invalid symbol is passed', async () => {
        let result = await TradeHelper.BuyTrade('ABC', 10, 10);
        result.type.should.equal('error');
        result.status.should.equal(400);
    });

    it('Should return error object if integer symbol is passed', async () => {
        let result = await TradeHelper.BuyTrade(123, 10, 10);
        result.type.should.equal('error');
        result.status.should.equal(500);
    });

    it('Should return a success response if new trade is place in new security', async () => {
        await PortfolioModel.deleteMany({});
        let ret = await TradeHelper.BuyTrade('TCS', 400, 4);
        ret.status.should.equal('success');
        ret.message.should.equal('trade purchased');
        ret.other.trade.length.should.equal(1);
    });

    it('Should return a success response if new trade is place in an existing security', async () => {
        let ret = await TradeHelper.BuyTrade('TCS', 300, 4);
        ret.status.should.equal('success');
        ret.message.should.equal('trade purchased');
        ret.other.trade.length.should.equal(2);
    });

    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for SellTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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

    it('Should return error object if invalid symbol is passed', async () => {
        let result = await TradeHelper.SellTrade('ABC', 10, 10);
        result.type.should.equal('error');
        result.status.should.equal(400);
    });

    it('Should return error object if integer symbol is passed', async () => {
        let result = await TradeHelper.SellTrade(123, 10, 10);
        result.type.should.equal('error');
        result.status.should.equal(500);
    });

    it('Should return a failed response as number of share purchased exceeded the share available', async () => {
        await TradeHelper.BuyTrade('TCS', 400, 4);
        let ret = await TradeHelper.SellTrade('TCS', 5);
        ret.type.should.equal('error');
        ret.message.should.equal('not enough share to sell');
    });

    it('Should return an error response if security is not there in portfolio', async () => {
        await PortfolioModel.deleteMany({});
        let ret = await TradeHelper.SellTrade('TCS', 3);
        ret.type.should.equal('error');
        ret.message.should.equal('security not found in the portfolio');
    });

    it('Should return a success response', async () => {
        await TradeHelper.BuyTrade('TCS', 400, 4);
        let ret = await TradeHelper.SellTrade('TCS', 3);
        ret.status.should.equal('success');
        ret.message.should.equal('trade sold');
    });

    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for RemoveTrade of TradeHelper Module', async () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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

    it('Should return error if invalid trade id is send', async ()=>{
        let ret = await TradeHelper.RemoveTrade(CommonMethod.generateId());
        console.log(ret);
        ret.type.should.equal('error');
        ret.status.should.equal(404);
    });

    it('Should return error if no trade is found with the given id', async ()=>{
        let ret = await TradeHelper.RemoveTrade(CommonMethod.generateId().toString());
        console.log(ret);
        ret.type.should.equal('error');
        ret.status.should.equal(404);
    });

    it('Should return Success Response', async ()=>{
        let buyTrade1 = await TradeHelper.BuyTrade('TCS', 1800, 8);
        let buyTrade2 = await TradeHelper.BuyTrade('TCS', 1800, 9);
        let tradeIdOf2 = buyTrade2.other.trade[1].tradeId;
        let removeTrade = await TradeHelper.RemoveTrade(tradeIdOf2);
        removeTrade.status.should.equal('success');
        removeTrade.tradeDetails.trade.length.should.equal(1);

    });

    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for UpdateTrade of TradeHelper Module', ()=>{
    let tradeId;
    let portfolio;
    let tcsfSaveResult;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
                let tcs = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                await tcs.save();
                let tcsf = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS) 1',
                    ticketSymbol: 'TCSF',
                    sharePrice: 1200,
                });
                tcsfSaveResult = await tcsf.save();
                await TradeHelper.BuyTrade('TCS', 400, 10);
                let ret = await TradeHelper.BuyTrade('TCS', 500, 4);
                tradeId = ret.other.trade[1].tradeId.toString();
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return error if trade id is sent null', async ()=>{
        let ret = await TradeHelper.UpdateTrade(null, {});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
    });

    it('Should return error if attributes id is sent null', async ()=>{
        let ret = await TradeHelper.UpdateTrade('123');
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('tradeId and attributes are required');
    });

    it('Should return error is unknown tradeId is send', async () => {
        let ret = await TradeHelper.UpdateTrade(CommonMethod.generateId(), {});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('no record found with this tradeId');
    });

    it('Should return error if the symbol is changed from one to another which is not in the system', async () =>{
        let ret = await TradeHelper.UpdateTrade(tradeId, {symbol: 'ABCDEF'});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('invalid security name passed');
    });

    it('Should return error if the invalid sharePrice is passed', async () =>{
        let ret = await TradeHelper.UpdateTrade(tradeId, {sharePrice: '123'});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('ticket price should be number');
    });

    it('Should return error if the invalid numberOfShares is passed', async () =>{
        let ret = await TradeHelper.UpdateTrade(tradeId, {numberOfShares: '123'});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('invalid number of shared passed');
    });

    it('Should return error if the invalid buyOrSell is passed', async () =>{
        let ret = await TradeHelper.UpdateTrade(tradeId, {buyOrSell: '123'});
        ret.type.should.equal('error');
        ret.status.should.equal(400);
        ret.message.should.equal('invalid value for buyOrSell attribute. Allowed values are [buy, sell]');
    });

    it('Should return success message if the valid attributes are passed', async () =>{
        let ret = await TradeHelper.UpdateTrade(tradeId, {symbol: 'TCSF',sharePrice: 123, numberOfShares: 4,  buyOrSell: 'buy'});
        ret.message.should.equal('attribute updated');
        let portfolio = await PortfolioModel.findOne({security: tcsfSaveResult._id});
        portfolio.averageBuyPrice.should.equal(123);
        portfolio.numberOfShares.should.equal(4);
        portfolio.trade.length.should.equal(1);
        portfolio.trade[0].buyOrSell.should.equal('buy');
    });

    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for GetPortfolio of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for GetReturn of TradeHelper Module', () => {
    let totalReturn;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for GetHolding of TradeHelper Module', () => {
    // create security
    // create portfolio
    let newPortfolio;
    let totalShares = 0;
    let totalSecurities = 0;
    let averageSharePrice = 0;
    let averagePrice = 0;
    let holdings;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
                let saveResult = await SecurityModel.insertMany([{
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                }, {
                    companyName: 'Tata Consultancy Services Limited (TCS) ASSOC',
                    ticketSymbol: 'TCSA',
                    sharePrice: 184,
                }]);
                await TradeHelper.BuyTrade('TCS', 800, 4);
                await TradeHelper.BuyTrade('TCSA', 400, 3);
                newPortfolio = await PortfolioModel.find().select('averageBuyPrice numberOfShares');
                newPortfolio.forEach(portfolio => {
                    totalSecurities += 1;
                    totalShares += portfolio.numberOfShares;
                    averageSharePrice += portfolio.averageBuyPrice
                });

                averagePrice = averageSharePrice / totalShares;
                holdings = await TradeHelper.GetHolding();

                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return success response', ()=>{
        holdings.status.should.equal('success');
    });

    it('Should return correct totalSecurities', ()=>{
        holdings.message.totalSecurities.should.equal(totalSecurities);
    });

    it('Should return correct totalShares', ()=>{
        holdings.message.totalShares.should.equal(totalShares);
    });

    it('Should return correct averagePrice', ()=>{
        holdings.message.averagePrice.should.equal(averagePrice);
    });

    after(function (done) {
        return mongoose.disconnect(done);
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
    });

    it('Should return error if invalid portfolio is passed', ()=>{
        let result = TradeHelper.CalculateReturn('123');
        result.status.should.equal('failedInCatch');
    });

    // we are assuming a valid portfolio will be passed in this method
});

describe('#Test cases for getPriceAndShareFromTrades of TradeHelper Module', ()=>{
    // let tradeObj;
    // let escapeTradeId;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                // let buy1 = await TradeHelper.BuyTrade('TCS', 400, 3);
                // let buy2 = await TradeHelper.BuyTrade('TCS', 600, 2);
                // let portfolio = await PortfolioModel.findOne({});
                // tradeObj = portfolio.trade;
                // escapeTradeId = [tradeObj[1].tradeId.toString()];
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return failed response if invalid tradeObjs is sent', ()=>{
        let ret = TradeHelper.getPriceAndShareFromTrades('1233', []);
        ret.status.should.equal('failedInCatch');
    });

    it('Should return the exact updated price and share price', async ()=>{
        await TradeHelper.BuyTrade('TCS', 800, 8);
        await TradeHelper.BuyTrade('TCS', 1000, 10);
        await TradeHelper.SellTrade('TCS', 4);
        let portfolio = await PortfolioModel.findOne();
        let tradeId = portfolio.trade[1].tradeId.toString();

        let ret = TradeHelper.getPriceAndShareFromTrades(portfolio.trade, [tradeId]);
        ret.should.be.a('object');
        ret.updatedPrice.should.equal(800);
        ret.updatedShares.should.equal(4);
        ret.tradeList.length.should.equal(2);
    });

    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for getTradeObjFromPortfolioObj of TradeHelper Module', ()=>{
    let tradeId;
    let portfolio;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
                let newSecurity = new SecurityModel({
                    companyName: 'Tata Consultancy Services Limited (TCS)',
                    ticketSymbol: 'TCS',
                    sharePrice: 1843.45,
                });
                let saveResult = await newSecurity.save();
                await TradeHelper.BuyTrade('TCS', 400, 4);
                await TradeHelper.BuyTrade('TCS', 800, 6);
                portfolio = await PortfolioModel.findOne();
                tradeId = portfolio.trade[0].tradeId;
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('Should return the correct tradeObj', ()=>{
        let ret = TradeHelper.getTradeObjFromPortfolioObj(tradeId, portfolio);
        ret.tradeId.should.equal(tradeId);
        ret.price.should.equal(400);
        ret.numberOfShares.should.equal(4);
        ret.buyOrSell.should.equal('buy');

    });


    after(function (done) {
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for validateTrade of TradeHelper Module', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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

    /**
     * As we have validated all the InputValidator,
     * so we need to only test the valid input type
     * **/

    it('Should return error message if shouldValidatePrice is true and sharePrice is invalid', async ()=>{
        let ret = await TradeHelper.validateTrade('TCS', 10, true, '123');
        console.log(ret);
        ret.status.should.equal('failed');
    });

    it('Should return error message if numberOfShares is invalid', async ()=>{
        let ret = await TradeHelper.validateTrade('TCS', '10', true, 123);
        console.log(ret);
        ret.status.should.equal('failed');
    });

    it('Should return error message if symbol is invalid', async ()=>{
        let ret = await TradeHelper.validateTrade('', 10, true, 123);
        console.log(ret);
        ret.status.should.equal('failed');
    });

    it('Should return error message if symbol is not there in the system', async ()=>{
        let ret = await TradeHelper.validateTrade('ABC', 10, true, 123);
        console.log(ret);
        ret.status.should.equal('failed');
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
        return mongoose.disconnect(done);
    });
});

describe('#Test cases for createNewPortfolio of TradeHelper Module', () => {
    let securityId, buyPrice = 400, numberOfShare = 5;
    let newPortfolio;
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                await PortfolioModel.deleteMany({});
                await SecurityModel.deleteMany({});
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
        return mongoose.disconnect(done);
    });
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

describe('#Test cases for getCurrentPriceOfSecurity of TradeHelper Module', () => {
    it('Should return 100', () => {
        let currentPrice = TradeHelper.getCurrentPriceOfSecurity('TCS');
        currentPrice.should.equal(100);
    })
});