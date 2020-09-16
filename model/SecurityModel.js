const mongoose = require('mongoose');

const securityModel = mongoose.Schema({
    companyName: {
        type: String
    },
    ticketSymbol: {
        type: String
    },
    sharePrice: {
        type: Number
    }
}, {timestamps: true});

module.exports = mongoose.model('SecurityModel', securityModel);