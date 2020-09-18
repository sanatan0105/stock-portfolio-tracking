let express = require('express');
let Router = express.Router();

const TradeHelper = require('../controller/TradeHelper');
const ReturnHandler = require('../lib/ReturnHandler');

Router.post('/addTrade', async (req, res) => {
    let symbol = req.body.symbol;
    let sharePrice = req.body.sharePrice;
    let numberOfShares = req.body.numberOfShares;
    let ret = await TradeHelper.BuyTrade(symbol, sharePrice, numberOfShares);
    ReturnHandler.returnHandler(ret, res);
});

Router.post('/removeTrade', async (req, res)=>{
    let symbol = req.body.symbol;
    let numberOfShares = req.body.numberOfShares;
    let ret = await TradeHelper.SellTrade(symbol, numberOfShares);
    ReturnHandler.returnHandler(ret, res);
});
module.exports = Router;
