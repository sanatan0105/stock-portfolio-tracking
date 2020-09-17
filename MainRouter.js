const express = require('express');
const Router = express.Router();

Router.use('/security', require('./routes/security'));
Router.use('/trade', require('./routes/trade'));
Router.use('/portfolio', require('./routes/portfolio'));
Router.use('/', async (req, res) => {
    res.status(200).json({
        message: 'ok',
    });
});

module.exports = Router;