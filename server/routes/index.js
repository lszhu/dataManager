var express = require('express');
var router = express.Router();
var util = require('util');
var path = require('path');

// for debug
var debug = require('debug')('route');

// account authentication
var auth = require('../lib/auth');
// access database
var db = require('../lib/mongodb');

/* GET home page. */
router.get('/', function(req, res) {
    debug("session: " + util.inspect(req.session));
    if (req.originalUrl == '/' || req.originalUrl == '/#') {
        res.render('index.html');
        //return;
    }
    //var hash = req.originalUrl.split('#')[1];
    //res.sendFile(__dirname + '/../../app/partials/' + hash + '.html');
    //res.send('welcome to cheque system.');
});

/* login page. */
router.get('/login', function(req, res) {
    res.render('login.html', {error: ''});
});

/* login page. */
router.post('/login', function(req, res) {
    //res.render('index', { title: 'login' });
    var acc = {
        username: req.body.username.trim(),
        password: req.body.password.trim()
    };
    debug('account: ' + JSON.stringify(acc));
    debug("session: " + util.inspect(req.session));
    db.getAccount(acc.username, function(error, account) {
        debug('account from DB: ' + JSON.stringify(account));
        debug('auth.auth(acc, account): ' + auth.auth(acc, account));
        if (error) {
            res.render('login.html', {error: '系统故障，请稍后重试！'});
            return;
        }
        if (auth.auth(acc, account)) {
            req.session.user = account ? account : auth.builtinUser;
            req.session.error = undefined;
            res.redirect('/');
        } else {
            res.render('login.html', {error: '用户名或密码错误！'})
        }
    });

});

router.all('/logout', function(req, res) {
    req.session.user = undefined;
    res.redirect('/login');
});

// welcome partial view
router.get('/welcome', function(req, res) {
    var root = path.resolve(__dirname + '/../../app/partials/');
    res.sendFile('welcome.html', {root: root});
});

// for angular.js to get partial view file
router.get(/\/.+\/(.+)/, function(req, res) {
    //res.render('partials/createProject.html', {error: ''});
    var root = path.resolve(__dirname + '/../../app/partials/');
    debug('root path: ' + root);
    var filename = req.params[0];
    debug('filename: ' + filename);
    res.sendFile('/' + filename + '.html', {root: root});
});

/* phonecat app as test page. */
router.get('/phonecat', function(req, res) {
  res.render('public/phonecat.html');
});

module.exports = router;
