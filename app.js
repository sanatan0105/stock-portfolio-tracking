console.log('1');
const createError = require('http-errors');
console.log('2');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./config/Winston');
console.log('3');
const mongoose = require('mongoose');
require('dotenv').config({path: './config/.env'});
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const app = express();
const Winston = require('./config/Winston');
console.log('4');
app.use(morgan('combined', { stream: winston.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
console.log('5');
const mon = require('./config/Database');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', require('./MainRouter'));

app.use(function(req, res, next) {
  next(createError(404));
});
console.log('6');
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
console.log('7');
app.listen(4001, function () {
  console.log('Example app listening on port 4001!');
});
console.log('8');
module.exports = app;
