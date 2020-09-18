const mongoose = require('mongoose');

const portfolioModel = mongoose.Schema({
    security: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SecurityModel',
        required: true,
    },
    averageBuyPrice: {
        type: Number,
        required: true
    },
    numberOfShares: {
        type: Number,
        required: true
    },
    trade: {
        type: Array,
        default: [{
            tradeId: {
                type: mongoose.Schema.Types.ObjectId
            },
            price: {
                type: Number,
                required: true
            },
            numberOfShares: {
                type: Number,
                required: true
            },
            buyOrSell: {
                type: String,
                enum: ['sell', 'buy']
            },
            dateOfPurchase: {
                type: Date
            }
        }]
    }
}, {timestamps: true});

module.exports = mongoose.model('PortfolioModel', portfolioModel);