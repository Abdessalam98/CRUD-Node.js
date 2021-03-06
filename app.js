const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const expressValidator = require("express-validator");
const bcrypt = require('bcrypt');

const moment = require('moment');

const index = require('./routes/index');
const users = require('./routes/users');
const posts = require('./routes/posts');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'bonjour',
  saveUninitialized: false,
  resave: true,
}));

app.use(
  expressValidator({
    errorFormatter(param, msg, value) {
      const namespace = param.split(".");
      const root = namespace.shift();
      let formParam = root;
      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return {
        param: formParam,
        msg,
        value
      };
    }
  })
);
app.use('/users/dashboard', function (req, res, next) {
  if (!req.session.connected) {
    return res.redirect('/users/signin')
  }
  return next();
})

mongoose.connect('mongodb://localhost/blog', error => {
  if (error) {
    throw error;
  }
});


app.use(function (req, res, next) {
  if (req.session) {
    res.locals.connected = req.session.connected;
    res.locals.user = req.session.user;
    app.locals.moment = require('moment');
    next();
  }
});


app.use('/', index);
app.use('/users', users);
app.use('/users/dashboard/posts', posts);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;