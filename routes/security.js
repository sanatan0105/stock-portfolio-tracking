let express = require('express');
let Router = express.Router();

const SecurityHelper = require('../controller/SecurityHelper');
const ReturnHandler = require('../lib/ReturnHandler');

Router.post('/create', async (req, res) => {
    let companyName = req.body.companyName;
    let ticketSymbol = req.body.ticketSymbol;
    let sharePrice = req.body.sharePrice;
    let ret = await SecurityHelper.createSecurity(companyName, ticketSymbol, sharePrice);
    ReturnHandler.returnHandler(ret, res);
});

Router.get('/', async (req, res) => {
    console.log('1');
    let securities = await SecurityHelper.getSecurities();
    ReturnHandler.returnHandler(securities, res);
});

Router.get('/getById/:id', async (req, res) => {
    let securityId = req.params.id;
    console.log(securityId);
    let security = await SecurityHelper.getSecurityById(securityId);
    ReturnHandler.returnHandler(security, res);
});

module.exports = Router;
