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
// miscellaneous tools
var tool = require('../lib/tool');

/* GET home page. */
router.get('/', function(req, res) {
    debug("session: " + util.inspect(req.session));
    res.render('index.html');
});

/* login page. */
router.get('/login', function(req, res) {
    res.render('login.html', {error: ''});
});

/* login page. */
router.post('/login', function(req, res) {
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

// for angular.js to get partial view file
router.get(/\/.+\/(.+)/, function(req, res) {
    var root = path.resolve(__dirname + '/../../app/partials/');
    debug('root path: ' + root);
    var filename = req.params[0];
    debug('filename: ' + filename);
    res.sendFile('/' + filename + '.html', {root: root});
});

router.post('/createProject', function(req, res) {
    var name =  req.body.name;
    if (!name) {
        res.send({status: 'nameErr', message: '项目名称不能为空'});
        return;
    }
    name = name.trim();
    var description = req.description ? req.description : '';
    description = description.trim();
    var logMsg = {
        operator: req.session.user.username,
        operation: '创建项目',
        target: name,
        comment: '数据库访问失败',
        status: '失败'
    };
    db.queryOne('project', {name: name}, function(err, doc) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询失败'});
            tool.log(db, logMsg,'数据库查询失败');
        } else if (doc) {
            res.send({status: 'duplicate', message: '系统中已存在此项目'});
            tool.log(db, logMsg, '项目已经存在');
        } else {
            db.count('project', {}, function(err, count) {
                if (err) {
                    console.log('Db error: ' + JSON.stringify(err));
                    res.send({status: 'dbErr', message: '统计项目总数失败'});
                    tool.log(db, logMsg, '统计项目总数失败');
                }
                console.log('save to db: ' + JSON.stringify({id: count + 1,
                    name: name, description: description}));
                db.save('project', {name: name}, {id: count + 1, name: name,
                    description: description},
                    function(err) {
                        if (err) {
                            console.log('Db error: ' + JSON.stringify(err));
                            res.send({status: 'dbErr', message: '数据保存失败'});
                            tool.log(db, logMsg, '数据保存失败');
                        } else{
                            res.send({status: 'ok', message: '创建项目成功'});
                            tool.log(db, logMsg, '创建项目成功', '成功');
                        }
                    }
                );
            });
        }
    });
});

router.post('/logReport', function(req, res) {
    var condition = {};
    if (req.body.operator) {
        condition.operator = new RegExp(req.body.operator.trim());
    }
    if (req.body.operation) {
        condition.operation = new RegExp(req.body.operation.trim());
    }
    if (req.body.target) {
        condition.target = new RegExp(req.body.target.trim());
    }
    if (req.body.comment) {
        condition.comment = new RegExp(req.body.comment.trim());
    }
    if (req.body.status) {
        condition.status = req.body.status;
    }
    var logMsg = {
        operator: req.session.user.username,
        operation: '日志查看',
        target: '日志数据库',
        comment: '数据库查询访问失败',
        status: '失败'
    };
    db.query('log', condition, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询访问失败'});
            tool.log(db, logMsg);
            return;
        }
        res.send(docs);
        tool.log(db, logMsg, '从数据库成功获取日志信息', '成功');
    });
});

module.exports = router;
