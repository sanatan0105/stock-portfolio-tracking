let express = require('express');
let Router = express.Router();

const TradeHelper = require('../controller/TradeHelper');
const ReturnHandler = require('../lib/ReturnHandler');

Router.get('/getPortfolio', async (req, res)=>{
    let ret = await TradeHelper.GetPortfolio();
    ReturnHandler.returnHandler(ret, res);
});

Router.get('/getReturn', async (req, res)=>{
    let ret = await TradeHelper.GetReturn();
    ReturnHandler.returnHandler(ret, res);
});

Router.get('/getHolding', async (req, res)=>{
    let ret = await TradeHelper.GetHolding();
    ReturnHandler.returnHandler(ret, res);
});

module.exports = Router;
