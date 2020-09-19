let express = require('express');
let Router = express.Router();

const TradeHelper = require('../controller/TradeHelper');
const ReturnHandler = require('../lib/ReturnHandler');

Router.post('/buyTrade', async (req, res) => {
    let symbol = req.body.symbol;
    let sharePrice = req.body.sharePrice;
    let numberOfShares = req.body.numberOfShares;
    let ret = await TradeHelper.BuyTrade(symbol, sharePrice, numberOfShares);
    ReturnHandler.returnHandler(ret, res);
});

Router.post('/sellTrade', async (req, res) => {
    let symbol = req.body.symbol;
    let numberOfShares = req.body.numberOfShares;
    let ret = await TradeHelper.SellTrade(symbol, numberOfShares);
    ReturnHandler.returnHandler(ret, res);
});

Router.delete('/removeTrade/:tradeId', async (req, res) => {
    let tradeId = req.params.tradeId;
    let ret = await TradeHelper.RemoveTrade(tradeId);
    ReturnHandler.returnHandler(ret, res);
});

Router.post('/updateTrade/:tradeId', async (req, res) => {
    let tradeId = req.params.tradeId;
    let attributes = req.body.attributes;
    let ret = await TradeHelper.UpdateTrade(tradeId, attributes);
    ReturnHandler.returnHandler(ret, res);
});
module.exports = Router;
