const express = require('express');
const Router = express.Router();

Router.use('/security', require('./routes/security'));
Router.use('/', async (req, res) => {
    res.status(200).json({
        message: 'ok',
    });
});

module.exports = Router;