const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./config/Winston');
const mongoose = require('mongoose');
require('dotenv').config({path: './config/.env'});
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const app = express();

app.use(morgan('combined', { stream: winston.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const mon = require('./config/Database');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', require('./MainRouter'));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


let port = process.env.PORT || 4000;
app.listen(port);
console.log('server started ' + port);

module.exports = app;
