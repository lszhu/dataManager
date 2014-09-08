var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var debug = require('debug')('app');

// get running environment selection from configuration file
var runningEnv = require('./config').runningEnv;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// set running environment
app.set('env', runningEnv);

// view engine setup
app.set('views', path.join(__dirname, '/../app'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/../app/public/img/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// support sessions used for authentication
app.use(session({
    name: 'ChequeSys.sid',
    secret: 'DoNotTouchMe',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '/../app/public')));
app.use(express.static(path.join(__dirname, '/../app/bower_components')));

// redirect to login page before any access
app.use('/', function(req, res, next) {
    debug('req.session: ' + JSON.stringify(req.session));
    if (!req.session.user && req.path != '/login') {
        req.session.error = 'NoLogin';
        return res.redirect('/login');
    }
    next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('404.html');
    //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
