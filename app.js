var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

// Authentication
var LocalStrategy = require('passport-local').Strategy;
var dbauth = require('./models/dbauth.js');

passport.serializeUser(dbauth.serialize);
passport.deserializeUser(dbauth.serialize); 
passport.use(new LocalStrategy(dbauth.checkLogin));

// Routes
var index = require('./routes/index');
var api = require('./routes/api');
var login = require('./routes/login');
var logout = require('./routes/logout'); 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
	secret: "catsarentlongenough",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', dbauth.jsonMiddleware(), api);
app.use('/login', login);
app.use('/logout', logout);
app.use('/', dbauth.htmlMiddleware(), index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
