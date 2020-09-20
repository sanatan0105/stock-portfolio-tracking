let CommonMethod = require('../../lib/CommonMethods');
let chai = require('chai');
const mongoose = require('mongoose');
let should = chai.should();

describe('Test cases for common methods', () => {
    let id = CommonMethod.generateId();
    it('Should return an 24 character length id', function() {
        id.should.be.a('object');
    });
    it('Should be a valid mongo id', ()=>{
        let a = mongoose.isValidObjectId(id.toString());
        a.should.equal(true);
    });
});