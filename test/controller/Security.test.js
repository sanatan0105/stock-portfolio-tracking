const SecurityHelper = require('../../controller/SecurityHelper');
const assert = require('assert');
const chai = require('chai');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect;
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

// createSecurity
describe('#Test Cases for createSecurity of SecurityHelper module', async () => {
    // As we already have tested the input validator, so we will only consider the valid input
    // companyName, ticketSymbol, sharePrice
    let result = null;
    let companyName = 'Tata Consultancy Services Limited (TCS)',
        ticketSymbol = 'TCS',
        sharePrice = 1843.45;

    before(done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                result = await SecurityHelper.createSecurity(companyName, ticketSymbol, sharePrice);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });


    it('Should return an object', () => {
        result.should.be.a('object');
    });

    it('Return Object should have a status object and should be equals to success', () => {
        expect(result).to.have.property('status');
        result.status.should.equal('success');
    });

    it('Return Object should have a message object and should be equals to security saved', () => {
        expect(result).to.have.property('message');
        result.message.should.equal('security saved');
    });

    it('Return Object should have a other object', () => {
        result.other.should.be.a('object');
    });

    it('other Object should have a companyName object and should be equals to company name in the argument', () => {
        expect(result.other).to.have.property('companyName');
        result.other.companyName.should.equal(companyName);
    });

    it('other Object should have a _id object', () => {
        expect(result.other).to.have.property('_id');
    });

    it('other Object should have a createdAt object', () => {
        expect(result.other).to.have.property('createdAt');
    });

    it('other Object should have a updatedAt object', () => {
        expect(result.other).to.have.property('updatedAt');
    });

    it('other Object should have a __v object', () => {
        expect(result.other).to.have.property('__v');
    });

    it('other Object should have a ticketSymbol object and should be equals to ticketSymbol in the argument', () => {
        expect(result.other).to.have.property('ticketSymbol');
        result.other.ticketSymbol.should.equal(ticketSymbol);
    });

    it('other Object should have a sharePrice object and should be equals to sharePrice in the argument', () => {
        expect(result.other).to.have.property('sharePrice');
        result.other.sharePrice.should.equal(sharePrice);
    });


    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});


// getSecurities
describe('#Test cases for getSecurities of SecurityHelper module', async () => {
    let securityObj = [
        {
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
    let result = null;
    let tcsObject;

    before( done => {
        mongoose.connect('mongodb://localhost:27017/test_portfolio', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.connection
            .once('open', async () => {
                result = await SecurityModel.insertMany(securityObj);
                done();
            })
            .on('error', error => {
                console.log(error);
            });
    });

    it('returns all the list of security in the security collection', async () => {
        let securities = await SecurityHelper.getSecurities();
        securities.should.be.a('object');
        securities.status.should.equal('success');
        securities.securities.should.be.a('array');
        securities.securities.length.should.equal(securityObj.length);
    });

    //getSecurityById
    it('should security object if security id is given as argument', async () => {
        tcsObject = result[0];
        let getById = await SecurityHelper.getSecurityById(tcsObject._id);
        getById.should.be.a('object');
        getById.status.should.equal('success');
        getById.security.should.be.a('object');
        getById.security.companyName.should.equal(tcsObject.companyName);
        getById.security.ticketSymbol.should.equal(tcsObject.ticketSymbol);
        getById.security.sharePrice.should.equal(tcsObject.sharePrice);

    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });
});

