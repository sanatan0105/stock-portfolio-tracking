const SecurityHelper = require('../../controller/SecurityHelper');
const assert = require('assert');
const chai = require('chai');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const SecurityModel = require('../../model/SecurityModel');


describe('#Test cases for _createObjForSecurity of SecurityHelper Module', () => {
    it('Should return an object with exactly the same value passed in the argument', () => {
        // companyName, ticketSymbol, sharePrice
        let companyName = 'Tata Consultancy Services Limited (TCS)';
        let ticketSymbol = 'TCS';
        let sharePrice = 800;
        let result = SecurityHelper.createObjForSecurity(companyName, ticketSymbol, sharePrice);
        result.should.be.a('object');
        result.companyName.should.equal(companyName);
        result.ticketSymbol.should.equal(ticketSymbol.toUpperCase());
        result.sharePrice.should.equal(sharePrice);
    });
});

// getSecurities
describe('#Test cases for getSecurities of SecurityHelper module', async () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', () => {
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    let tcsObject;
    let securityObj = [{
        companyName: 'Tata Consultancy Services Limited (TCS)',
        ticketSymbol: 'TCS',
        sharePrice: 1843.45,
    }, {
        companyName: 'Wipro Information technology company',
        ticketSymbol: 'WIPRO',
        sharePrice: 319.25,
    }, {
        companyName: 'Godrej Industries Ltd',
        ticketSymbol: 'GODREJIND',
        sharePrice: 535.00,
    }];

    let saveResult = await SecurityModel.insertMany(securityObj);
    tcsObject = saveResult[0];
    it('returns all the list of security in the security collection', async () => {
        let securities = await SecurityHelper.getSecurities();
        securities.should.be.a('object');
        securities.status.should.equal('success');
        securities.securities.should.be.a('array');
        securities.securities.length.should.equal(securityObj.length);
    });

    //getSecurityById
    it('should security object if security id is given as argument', async ()=>{
        let getById = await SecurityHelper.getSecurityById(tcsObject._id);
        console.log(getById);
        getById.should.be.a('object');
        getById.status.should.equal('success');
        getById.security.should.be.a('object');
        getById.security._id.should.equal(tcsObject._id);
        getById.security.companyName.should.equal(tcsObject.companyName);
        getById.security.ticketSymbol.should.equal(tcsObject.ticketSymbol);
        getById.security.sharePrice.should.equal(tcsObject.sharePrice);

    });

    after(function (done) {
        console.log('Deleting test_portfolio database');
        mongoose.connection.db.dropDatabase(done);
    });
});

