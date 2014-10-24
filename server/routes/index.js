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
// helper for project operation
var proj = require('../lib/projectTool');

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

// get subject list include id and name
router.get('/subject', function(req, res) {
    res.send(tool.subject);
});

// for showing pdf in browser
router.get('/pdfShow', function(req, res) {
    //res.send('ok');
    res.render('pdfShow.html');
});

router.get('/pdf', function(req, res) {
    var logMsg = {
        operator: req.session.user.username,
        operation: '查看pdf文档',
        target: '财务凭证数据库',
        comment: '',
        status: '失败'
    };
    debug('process pdf');

    db.queryOne('figure', {id: req.query.id}, function(err, doc) {
        if (err) {
            tool.log(db, logMsg, '数据库访问失败');
            res.send('');
            return;
        }
        if (!doc || !doc.voucher || !doc.voucher.path) {
            tool.log(db, logMsg, '未找到关联的电子文档信息');
            res.send('');
            return;
        }
        debug('voucher path: ' + doc.voucher.path);
        tool.readFile(doc.voucher.path, function(data) {
            logMsg.target = data.target;
            if (data.status != 'ok') {
                res.send('');
                tool.log(db, logMsg, data.message);
                return;
            }
            res.send(data.data);
            tool.log(db, logMsg, data.message);
        });
    });
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
    var project = proj.parseProject(req);
    if (!project.name) {
        res.send({status: 'nameErr', message: '项目名称不能为空'});
        return;
    }
    if (project.newName && project.name != project.newName) {
        res.send({status: 'nameErr', message: '项目创建参数错误'});
        return;
    }
    debug('project: ' + JSON.stringify(project));
    var logMsg = {
        operator: req.session.user.username,
        operation: '修改项目',
        target: project.name,
        comment: '数据库访问失败',
        status: '失败'
    };

    db.query('project', {}, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询失败'});
            tool.log(db, logMsg,'数据库查询失败');
            return;
        }

        if (docs.some(function(e) {return e.name == project.name;}) &&
            req.body.option != 'arbitrary') {
            res.send({status: 'duplicate', message: '系统中已存在此项目'});
            tool.log(db, logMsg, '项目已经存在');
            return;
        }

        // check recursive descendant
        if (proj.recursiveSubProject(docs, project)) {
            res.send({status: 'recursive', message: '存在循环父子项目'});
            tool.log(db, logMsg, '存在循环父子项目');
            return;
        }

        // insert a new project
        proj.updateProject(db, docs, project, res, logMsg);
    });
});

router.post('/updateProject', function(req, res) {
    var project = proj.parseProject(req);
    if (!project.name) {
        res.send({status: 'nameErr', message: '项目名称不能为空'});
        return;
    }
    debug('project: ' + JSON.stringify(project));
    var logMsg = {
        operator: req.session.user.username,
        operation: '修改项目',
        target: project.name,
        comment: '数据库访问失败',
        status: '失败'
    };

    db.query('project', {}, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询失败'});
            tool.log(db, logMsg,'数据库查询失败');
            return;
        }

        // check recursive descendant
        if (proj.recursiveSubProject(docs, project)) {
            res.send({status: 'recursive', message: '存在循环父子项目'});
            tool.log(db, logMsg, '存在循环父子项目');
            return;
        }
        proj.updateProject(db, docs, project, res, logMsg);
        //if (project.newName && project.newName != project.name) {
        //    proj.renameProject(db, docs, project, res, logMsg);
        //} else {
        //    debug('update project without changing name.');
        //    proj.updateProject(db, docs, project, res, logMsg);
        //}
    });
});

router.post('/removeProject', function(req, res) {
    var name = req.body.name;
    if (!name) {
        res.send({status: 'nameErr', message: '项目名称不能为空'});
        return;
    }
    var logMsg = {
        operator: req.session.user.username,
        operation: '删除项目',
        target: name,
        comment: '数据库操作失败',
        status: '失败'
    };
    name = name.trim();
    db.queryOne('project', {name: name}, function(err, doc) {
        if (err) {
            res.send({status: 'dbErr', message: '数据库操作失败'});
            tool.log(db, logMsg);
            return;
        } else if (!doc) {
            res.send({status: 'noProject', message: '未找到相应相应项目'});
            tool.log(db, logMsg, '未找到相应相应项目', '失败');
            return;
        }
        if (doc.children && doc.children.length) {
            res.send({status: 'parentProject',
                message: '该项目含有子项目，无法删除'});
            tool.log(db, logMsg, '试图删除父项目', '失败');
            return;
        }
        proj.deleteProject(db, doc, res, logMsg);
    });
});

router.post('/pisTable', function(req, res) {
    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;

    var condition = tool.period(req.body.dateFrom, req.body.dateTo,
        delta, req.body.timezone);
    // so as to use the balance from previous year,
    // query should start from the beginning of the year
    var startDate = new Date(0);
    if (condition && condition.$gte) {
        startDate = condition.$gte;
        condition.$gte = new Date(startDate.getFullYear().toString());
    }
    condition = condition ? {date: condition} : {};

    var project = req.body.projectName;
    if (!project) {
        res.send({status: 'projectErr', message: '请准确输入合法项目名称'});
        return;
    }
    condition.project = project;

    // include sub project switch
    var includeSubProject = req.body.includeSubProject;
    debug('includeSubProject: ' + includeSubProject);

    var logMsg = {
        operator: req.session.user.username,
        operation: 'pis财务报表创建',
        target: '凭证数据库',
        comment: '数据库查询访问失败',
        status: '失败'
    };

    db.query('project', {}, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询访问失败'});
            tool.log(db, logMsg);
            return;
        }
        if (includeSubProject) {
            var relatives = proj.getRelatives(project, docs);
            condition.project = {$in: relatives};
        }

        debug('condition: %j', condition);
        db.query('figure', condition, function(err, docs) {
            if (err) {
                console.log('Db error: ' + JSON.stringify(err));
                res.send({status: 'dbErr', message: '数据库查询访问失败'});
                tool.log(db, logMsg);
                return;
            }
            debug('figures count: %d', docs.length);
            var pisList = tool.pisList(docs, startDate);
            //debug('pisList: %j', pisList);
            res.send(pisList);
            tool.log(db, logMsg, pisList.message,
                    pisList.status == 'ok' ? '成功' : '失败');
        });
    });

});

router.post('/logReport', function(req, res) {
    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;
    var condition = tool.period(req.body.startDate, req.body.endDate,
        delta, req.body.timezone);
    condition = condition ? {time: condition} : {};
    debug('date: ' + JSON.stringify(condition));

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
        res.send({logs: docs});
        tool.log(db, logMsg, '从数据库成功获取日志信息', '成功');
    });
});

router.post('/queryFile', function(req, res) {
    var relativePath = req.body.path;
    var logMsg = {
        operator: req.session.user.username,
        operation: '获取文件列表',
        target: '原始财务数据文件存放目录',
        comment: '获取文件列表失败',
        status: '失败'
    };
    tool.listFiles(res, relativePath, function(err, data, res) {
        if (err) {
            res.send({status: 'listFileErr', message: '获取文件列表失败'});
            tool.log(db, logMsg);
            return;
        }
        res.send({status: 'ok', fileData: data});
        tool.log(db, logMsg, '文件获取成功', '成功');
    });
});

router.post('/queryProject', function(req, res) {
    var condition = {};
    if (req.body.name) {
        condition.name = new RegExp(req.body.name.trim());
    }
    if (req.body.id) {
        condition.id = new RegExp(req.body.id.trim());
    }
    if (req.body.description) {
        condition.description = new RegExp(req.body.description.trim());
    }
    var logMsg = {
        operator: req.session.user.username,
        operation: '项目查看',
        target: '项目数据库',
        comment: '数据库查询访问失败',
        status: '失败'
    };
    db.query('project', condition, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbReadErr', message: '数据库查询访问失败'});
            tool.log(db, logMsg);
            return;
        }
        res.send({status: 'ok', projects: docs});
        tool.log(db, logMsg, '从数据库成功获取日志信息', '成功');
    });
});

router.post('/queryVoucher', function(req, res) {
    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;
    var condition = tool.period(req.body.dateFrom, req.body.dateTo,
        delta, req.body.timezone);
    condition = condition ? {date: condition} : {};
    debug('date: %j', condition);

    var interval = tool.interval(req.body.amountFrom, req.body.amountTo);
    if (interval) {
        condition.$or = [{debit: interval}, {credit: interval}];
        debug('condition: %j', condition);
    }

    if (req.body.voucherId) {
        condition['voucher.id'] = new RegExp(req.body.voucherId.trim());
    }
    if (req.body.project) {
        condition.project = new RegExp(req.body.project.trim());
    }
    if (req.body.subjectName) {
        condition.subjectName = new RegExp(req.body.subjectName.trim());
    }
    if (req.body.description) {
        condition.description = new RegExp(req.body.description.trim());
    }

    var logMsg = {
        operator: req.session.user.username,
        operation: '财务凭证数据查看',
        target: '财务凭证数据数据库',
        comment: '数据库查询失败',
        status: '失败'
    };
    db.query('figure', condition, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询失败'});
            tool.log(db, logMsg);
            return;
        }
        //debug('financial figures: %j', docs);
        res.send({figures: docs});
        tool.log(db, logMsg, '成功查询到财务凭证数据', '成功');
    });
});

router.post('/importFigure', function(req, res) {
    var style = req.body.style,
        filePath = req.body.path,
        projectName = req.body.projectName,
        year = req.body.year;
    debug('style: %s, filePath: %s, year: %s', style, filePath, year);
    if (!style || !filePath  || !year) {
        res.send({status: 'parameterErr', message: '提供处理的信息不完整'});
        return;
    }
    var logMsg = {
        operator: req.session.user.username,
        operation: '财务凭证数据导入',
        target: '财务凭证数据库',
        comment: '',
        status: '失败'
    };
    if (style == 'server') {
        tool.importFigures(db, filePath, projectName, year, function(msg) {
            res.send(msg);
            tool.log(db, logMsg, msg.comment, msg.result);
        });
    }
});

router.post('/voucherAutoBind', function(req, res) {
    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;
    var condition = tool.period(req.body.dateFrom, req.body.dateTo,
        delta, req.body.timezone);
    condition = condition ? {date: condition} : {};
    if (req.body.project && req.body.project != 'all') {
        condition.project = req.body.project;
    }
    if (req.body.subject && req.body.subject != 'all') {
        condition.subjectId = req.body.subject;
    }
    debug('condition: ' + JSON.stringify(condition));

    var alarm = req.body.onlyUnbound;
    var rewrite = req.body.rewriteBound;

    db.query('figure', condition, function(err, docs) {
        var logMsg = {
            operator: req.session.user.username,
            operation: '财务凭证电子文件关联',
            target: '财务凭证数据库',
            comment: '部分数据无法关联到相应凭证的电子文件',
            status: '失败'
        };
        if (err) {
            res.send({status: 'dbErr', message: '数据库访问故障'});
            tool.log(db, logMsg, '数据库访问故障');
            return;
        }
        var filtered = [];
        // filter voucher.id = 10000 which has no voucher
        for (var i = 0, len = docs.length; i < len; i++) {
            if (docs[i].voucher.id != '10000') {
                filtered.push(docs[i]);
            }
        }
        tool.voucherAutoBind(db, filtered, alarm, rewrite, function(data) {
            if (!data.noVouchers.length && !data.dbSaveErrs.length) {
                res.send({status: 'ok',
                    message: '财务数据与凭证电子文件关联成功'});
                tool.log(db, logMsg, '财务数据与凭证电子文件关联成功', '成功');
                return;
            }
            res.send({status: 'bindErr', message: logMsg.comment, data: data});
            tool.log(db, logMsg);
        });
    });
});

module.exports = router;
