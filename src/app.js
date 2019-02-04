const express = require('express');
const app = express();
const http = require('http').Server(app);
const session = require('express-session');
const flash = require('connect-flash');
const { join } = require('path');

require('./helpers/socket')(http);

const routesMain = require('./routes/main');
const bodyParser = require('body-parser');
const helpers = require('./helpers/helpers');

app.set('view engine', 'pug');
app.set('views', join(__dirname, '..', 'views'));

// Cookies!
app.use(
  session({
    secret: 'cpi-logs',
    maxAge: 60000 * 60 * 24,
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());

app.use(express.static(join(__dirname, '..', './public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  next();
});
app.use('/', routesMain);

module.exports = http;
