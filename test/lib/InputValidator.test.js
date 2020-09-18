// let CommonMethod = require('../../lib/CommonMethods');
// let assert = require('assert');
// let chai = require('chai');
// const mongoose = require('mongoose');
// let should = chai.should();
//
// describe('Test cases for common methods', () => {
//     let id = CommonMethod.generateId();
//     it('Should return an 24 character length id', function() {
//         id.should.be.a('object');
//     });
//     it('Should be a valid mongo id', ()=>{
//         let a = mongoose.isValidObjectId(id.toString());
//         a.should.equal(true);
//     });
// });

let InputValidator = require('../../lib/InputValidator');
let chai = require('chai');
let should = chai.should();

describe('Test Cases for ValidateQuantity of input validator module', () => {
    // ValidateQuantity
    it('Should return false if empty quantity is send as input', () => {
        let valid = InputValidator.ValidateQuantity('');
        valid.should.equal(false);
    });

    it('Should return false if string is send as input', () => {
        let valid = InputValidator.ValidateQuantity('123');
        valid.should.equal(false);
    });

    it('Should return false if negative or zero is send as input', () => {
        let valid = InputValidator.ValidateQuantity(-12);
        valid.should.equal(false);
        valid = InputValidator.ValidateQuantity(0);
        valid.should.equal(false);
    });

    it('Should return true if positive number is send as input', () => {
        let valid = InputValidator.ValidateQuantity(5);
        valid.should.equal(true);
    });
});

describe('Test Cases for ValidateSecurityName of input validator module', ()=>{
    // ValidateSecurityName
    it('Should return failed object if empty string is send', () => {
        let name = '';
        let valid = InputValidator.ValidateSecurityName(name);
        valid.status.should.equal('failed');
    });
    it('Should return failed object if big character is send', () => {
        let name = 'a'.repeat(160);
        let valid = InputValidator.ValidateSecurityName(name);
        valid.status.should.equal('failed');
    });
    it('Should return success object is ValidateSecurityName is send', ()=>{
        let name = 'Tata Consultancy Services';
        let valid = InputValidator.ValidateSecurityName(name);
        valid.status.should.equal('success');
    });
});

describe('Test Cases for ValidateTicketSymbol of inputValidator module', ()=>{
    // ValidateTicketSymbol
    it('Should return failed object if empty string is send', () => {
        let name = '';
        let valid = InputValidator.ValidateTicketSymbol(name);
        valid.status.should.equal('failed');
    });
    it('Should return false if big character is send', () => {
        let name = 'a'.repeat(12);
        let valid = InputValidator.ValidateTicketSymbol(name);
        valid.status.should.equal('failed');
    });
    it('Should return true is ValidateSecurityName is send', ()=>{
        let name = 'TCS';
        let valid = InputValidator.ValidateTicketSymbol(name);
        valid.status.should.equal('success');
    });
});

describe('Test Cases for ValidateSharePrice of inputValidator module', ()=>{
    it('Should return failed object if price is set to empty or null', ()=>{
        let valid = InputValidator.ValidateSharePrice('');
        valid.status.should.equal('failed');
        valid = InputValidator.ValidateSharePrice(null);
        valid.status.should.equal('failed');
    });
    it('Should return failed object if price is set to a string input', ()=>{
        let valid = InputValidator.ValidateSharePrice('123');
        valid.status.should.equal('failed');
    });
    it('Should return success object if price is a normal number', ()=>{
        let valid = InputValidator.ValidateSharePrice(123);
        valid.status.should.equal('success');
    });
});