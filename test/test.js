let InputValidator = require('../lib/InputValidator');
let assert = require('assert');


// describe('Simple String Test', function () {
//     it('should return number of charachters in a string', function () {
//         assert.equal("Hello World!".length, 12);
//     });
// });

describe('Test cases for input validator', function() {
    it('Should return true if positive number is give as input', function() {
        let result = InputValidator.ValidateQuantity(10);
        assert.equal(result, true);
    });

    it('Should return false if negative number is give as input', function() {
        let result = InputValidator.ValidateQuantity(-10);
        assert.equal(result, false);
    });

    it('Should return true if 0 is give as input', function() {
        let result = InputValidator.ValidateQuantity(0);
        assert.equal(result, true);
    });
});