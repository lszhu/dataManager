var debug = require('debug')('tool');
var path = require('path');
//var excel = require('j');
var xlsx = require('xlsx');
var fs = require('fs');

var dictionary = readJsonFile(
    path.join(__dirname, '../../staticData/dictionary.json'));

var subjectMap = readJsonFile(
    path.join(__dirname, '../../staticData/subjectMap.json'));

// 解析读入并解析JSON文件
function readJsonFile(filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.log('read file %j error', filePath);
    }
}

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
    if (span.hasOwnProperty('$gte') || span.hasOwnProperty('$lte')) {
        return span;
    }
}

// 返回格式为{$gte: from, $lte: to}，如果给定参数无效，则返回空
function interval(from, to) {
    var span = {};
    if (!isNaN(parseFloat(from))) {
        span.$gte = from;
    }
    if (!isNaN(parseFloat(to))) {
        span.$lte = to;
    }
    if (span.hasOwnProperty('$gte') || span.hasOwnProperty('$lte')) {
        return span;
    }
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
        var xlsxData = xlsx.readFile(fullPath);
        var sheetName = xlsxData.SheetNames[0];
        xlsxData = xlsx.utils.sheet_to_json(
            xlsxData.Sheets[sheetName],
            {raw: true}
        );
    } catch (e) {
        console.log('ok here');
        //console.log('parse excel file error: ' + JSON.stringify(e));
        importMsg.status = 'fileParseErr';
        importMsg.message = '无法读取凭证数据文件，或文件格式错误';
        importMsg.comment = '无法读取或分析相应文件内容';
        callback(importMsg);
        return;
    }

    //var msg = figureList(xlsxData.Sheets, importMsg.projectName, year);
    var msg = figureList(xlsxData, importMsg.projectName, year);
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
    db.batchSaveFigures(msg.data, function(err, num) {
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
        importMsg.message = '成功导入' + num + '条凭证数据';
        importMsg.comment = '成功导入' + num + '条凭证数据';
        importMsg.result = '成功';
        callback(importMsg);
    });
}

function countRow(sheet) {
    return sheet['!ref'].split(':')[1].match(/\d+$/)[0];
}

function figureList(sheets, projectName, year) {
    //debug('dictionary: %j', dictionary);
    var col = dictionary.excelColumn;
    debug('row items: %j', col);
    //var item, doc;
    var filter = [];
    var errLine = [];
    var illegal = false;
    for (var i = 0; i < sheets.length; i++) {
        var row = {};
        if (!sheets[i][col.subjectId] && !sheets[i][col.subjectName]) {
            continue;
        }
        row.project = projectName;

        row.voucher = {id: sheets[i][col.voucherId]};
        row.subjectId = sheets[i][col.subjectId];
        row.subjectName = sheets[i][col.subjectName];
        row.description = sheets[i][col.description];
        row.debit = sheets[i][col.debit];
        row.credit = sheets[i][col.credit];
        row.direction = sheets[i][col.direction];
        if (!row.direction) {
            row.direction = sheets[i][col.direction + 8];
            if (!row.direction) {
                row.direction = sheets[i][col.direction + 7];
            }
        }
        row.balance = sheets[i][col.balance];

        if (!row.voucher.id) {
            if (row.description && row.description.trim() != '上年结转') {
                errLine.push(i + 2);
                debug('errLine: %j', row);
                continue;
            }
            // 令上年结转数据条目的凭证号为10000，不同于任何普通凭证号
            row.voucher = {id: '10000'};
            // 令上年结转数据条目产生日期为年度1月1日0时（当地时间）
            row.date = new Date(year.toString());
            debug('row: %j', row);
        } else if (!sheets[i][col.month] || !sheets[i][col.date]) {
            errLine.push(i + 2);
            //debug('errLine: %j', row);
            continue;
        } else {
            row.date = new Date(
                year, sheets[i][col.month] - 1, sheets[i][col.date]);
        }
        if (isNaN(row.debit) || isNaN(row.credit) || isNaN(row.balance)) {
            errLine.push(i + 2);
            //debug('errLine: %j', row);
            continue;
        }
        row.id = figureId(row);
        filter.push(row);
    }
    /*
    for (var sheet in sheets) {
        if (!sheets.hasOwnProperty(sheet)) {
            continue;
        }
        var maxLine = countRow(sheets[sheet]);
        debug('sheet maxLine: ' + maxLine);
        //debug('sheet: %j', sheets[sheet]);
        for (var i = 2; i < maxLine; i++) {
            if (!sheets[sheet][col.voucherId + i]) {
                // 记录上年结转的数据
                if (sheets[sheet][col.subjectId + i]) {

                }
                continue;
            }
            var row = {};
            for (j in col) {
                if (!col.hasOwnProperty(j)) {
                    continue;
                }
                if (sheets[sheet][col[j] + i]) {
                    row[j] = sheets[sheet][col[j] + i].v
                } else {
                    if (j != 'description') {
                        illegal = true;
                        break;
                    }
                }
            }
            if (illegal) {
                illegal = false;
                errLine.push('工作表：' + sheet + '， 第' + i + '行。');
                continue;
            }
            row.project = projectName;
            row.date = new Date(year, row.month, row.date);
            row.month = undefined;
            row.voucher = {id: row.voucherId};
            row.voucherId = undefined;
            row.id = figureId(row);
            debug('balance: ' + row.balance);
            debug('row id: ' + row.id);
            filter.push(row);
        }
    }
    */
    //debug('voucher data: %j', filter);
    debug('error lines: %j', errLine);
    return {data: filter, errLine: errLine};
}

function psiList(figures) {
    var subject = {};
    var id, init, end;
    for (var i = 0; i < figures.length; i++) {
        id = figures[i].subjectId;
    }
}

function figureId(row) {
    var date = row.date.getFullYear() + '' +
        row.date.getMonth() + row.date.getDate();
    var p1 = row.voucher.id.toString().split('-');
    p1 = date + (p1[1] === undefined ? p1[0] : p1[1]);
    var p2 = row.subjectId + '' + Math.round(Math.abs(row.balance) * 100);
    return parseInt(p1).toString(36) + parseInt(p2).toString(36);
}

module.exports = {
    log: log,
    period: period,
    importFigures: importFigures,
    interval: interval,
    psiList: psiList
};