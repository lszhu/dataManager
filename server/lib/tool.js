var debug = require('debug')('tool');
var path = require('path');
var excel = require('j');

// 向db指定的数据库中写入日志信息
function log(db, doc, comment, status) {
    doc.time = new Date();
    if (comment) {
        doc.comment = comment;
    }
    if (status) {
        doc.status = status;
    }
    //console.log('logMsg: ' + JSON.stringify(doc));
    db.save('log', {time: 0}, doc, function(err) {
        if (err) {
            console.log('error: ' + JSON.stringify(err));
        }
    });
}

// 开始时间点为start，结束时间点为end后延delta毫秒，delta可以是负数。
// timezone为原始时间的时区偏移量，依照惯例，单位是分钟。
// 返回格式为{$gte: from, $lte: to}，时间值为国际标准时间
function period(start, end, delta, timezone) {
    if (isNaN(timezone) || timezone < -720 || 720 < timezone) {
        timezone = 0;
    }
    var span = {};
    if (start) {
        var from = new Date(start);
        if (from.toDateString() != "Invalid Date") {
            span.$gte = new Date(from.getTime() + timezone * 60000);
        }
    }
    if (end) {
        var to = new Date(end);
        if (to.toDateString() != "Invalid Date") {
            span.$lte = new Date(to.getTime() + timezone * 60000 + delta);
        }
    }
    if (!span.hasOwnProperty('$gte') && !span.hasOwnProperty('$lte')) {
        return undefined;
    }
    return span;
}

// 向db指定的数据库中导入财务凭证数据
function importFigures(db, filePath, projectName, year, callback) {
    var basePath = require('../config').importPath;
    var fullPath = path.join(basePath, filePath);
    var filename = path.basename(fullPath, path.extname(fullPath));
    var importMsg = {
        projectName: (projectName ? projectName : filename),
        year: year,
        path: path.dirname(fullPath),
        filename: path.basename(fullPath),
        comment: '',
        result: '失败',
        errLines: ''
    };

    try {
        var data = excel.readFile(fullPath);
        data = excel.utils.to_json(data);
    } catch (e) {
        console.log('ok here');
        //console.log('parse excel file error: ' + JSON.stringify(e));
        importMsg.status = 'fileParseErr';
        importMsg.message = '无法读取凭证数据文件，或文件格式错误';
        importMsg.comment = '无法读取或分析相应文件内容';
        callback(importMsg);
        return;
    }

    var msg = figureList(data, importMsg.projectName, year);
    if (msg.errLine.length > 0) {
        console.log('file contents illegal');
        console.log('error lines: %j', msg.errLine);
        importMsg.status = 'fileContentErr';
        importMsg.message = '凭证数据文件内容不符合要求';
        importMsg.comment = '凭证数据文件内容错误';
        importMsg.errLines = msg.errLine;
        callback(importMsg);
        return;
    }
    db.batchSaveFigures(msg.data, function(err) {
        if (err) {
            importMsg.status = 'dbWriteErr';
            importMsg.message = '数据库写入错误';
            importMsg.comment = '出现' + err.length + '个数据库写入错误';
            console.log('db write errors: %j', importMsg);
            console.log('error details: %j', err);
            callback(importMsg);
            return;
        }
        importMsg.status = 'ok';
        importMsg.message = '成功导入数据';
        importMsg.comment = '成功导入数据';
        importMsg.result = '成功';
        callback(importMsg);
    });
}

function figureList(data, projectName, year) {
    var item, doc;
    var filter = [];
    var errLine = [];
    for (var sheet in data) {
        if (!data.hasOwnProperty(sheet)) {
            continue;
        }
        for (var i = 0; i < data[sheet].length; i++) {
            item = data[sheet][i];
            if (!item['凭证号数']) {
                continue;
            }
            if (item['月'] && item['科目编码'] && item['借方'] &&
                item['贷方'] && item['余额']) {
                if (!item['日']) {
                    item['日'] = 28;
                }
                doc = {
                    project: projectName,
                    date: new Date(year, item['月'], item['日']),
                    voucher: {
                        id: item['凭证号数']
                    },
                    subject: item['科目编码'],
                    comment: item['摘要'],
                    debit: item['借方'],
                    credit: item['贷方'],
                    direction: (item['方向8'] ? item['方向8'] : item['方向7']),
                    balance: item['余额']
                };
                doc.direction = item['方向'] ? item['方向'] : doc.direction;
                doc.id = figureId(doc.date, doc.voucher.id, doc.subjectId);
                filter.push(doc);
            } else {
                errLine.push({'工作表': sheet, '行号': i + 2});
            }
        }
    }
    debug('voucher data: %j', filter);
    debug('error lines: %j', errLine);
    return {data: filter, errLine: errLine};
}

function figureId(date, voucherId, subjectId) {
    var id =  date.getTime() + voucherId.split('-')[1] + subjectId;
    return parseInt(id).toString('36');
}

module.exports = {
    log: log,
    period: period,
    importFigures: importFigures
};