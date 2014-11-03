var debug = require('debug')('tool');
var path = require('path');
var util = require('util');
//var excel = require('j');
var xlsx = require('xlsx');
var fs = require('fs');

var refPath = require('../config').path;

var dictionary = readJsonFile(
    path.join(__dirname, '../../staticData/dictionary.json'));

var subjectMap = readJsonFile(
    path.join(__dirname, '../../staticData/subjectMap.json'));

var banPdf = readFileInBuf(
    path.join(__dirname, '../../staticData/banPdf.pdf'));

// 解析读入并解析JSON文件
function readJsonFile(filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.log('read file %j error', filePath);
        return '';
    }
}

// 读取显示禁止pdf的文件内容
function readFileInBuf(filePath) {
    try {
        return fs.readFileSync(filePath);
    } catch (e) {
        console.log('read file %j error', filePath);
        return '';
    }
}

// 向db指定的数据库中写入日志信息
function log(db, doc, comment, status) {
    doc = doc ? doc : {};
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
// start和end为YYYY-MM-DD形式，或其他可用于正确为Date初始化的量
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

// 列出指定目录中的文件列表
// 回调函数为callback(err, data, res)
function listFiles(res, relativePath, callback) {
    var fullPath = path.join(__dirname, refPath.voucher, relativePath);
    debug('fullPath: ' + fullPath);
    fs.readdir(fullPath, function (err, files) {
        debug('files' + JSON.stringify(files));
        //categoryFiles(relativePath, files, err, res, callback);
        if (err || files.length == 0) {
            callback(err, {dirs: [], files: [], path: relativePath}, res);
            return;
        }
        var dirs = [];
        var stdFiles = [];
        var counter = {count: 0};
        for (var i = 0; i < files.length; i++) {
            counter.count++;
            fs.stat(fullPath + '/' + files[i], function(file) {
                return function (err, stats) {
                    counter.count--;
                    if (err && counter.count) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        dirs.push(file);
                    } else if (stats.isFile()) {
                        stdFiles.push(file);
                    }
                    if (!counter.count) {
                        var data = {
                            dirs: dirs.sort(),
                            files: stdFiles.sort(),
                            path: relativePath
                        };
                        debug('file data: ' + JSON.stringify(data));
                        callback(null, data, res);
                    }
                    debug('counter.count: ' + counter.count);
                }
            }(files[i]));
        }
    });
}

// 向db指定的数据库中导入财务凭证数据
// 回调函数格式为callback(message)
function importFigures(db, filePath, projectName, year, callback) {
    var basePath = refPath.base;
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

// 获取excel表格的行数
function countSheetRow(sheet) {
    return sheet['!ref'].split(':')[1].match(/\d+$/)[0];
}

// 分析导入excel文件的每一行数据，
// 正确数据存入返回的data属性，非法行记录到errLine中
function figureList(sheets, projectName, year) {
    //debug('dictionary: %j', dictionary);
    var col = dictionary['excelColumn'];
    debug('row items: %j', col);
    //var item, doc;
    var filter = [];
    var errLine = [];

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
                errLine.push(i + 2 + '行，不确定是否是上年结转；');
                debug('errLine: %j', row);
                continue;
            }
            // 令上年结转数据条目的凭证号为10000，不同于任何普通凭证号
            row.voucher = {id: '10000'};
            // 令上年结转数据条目产生日期为年度1月1日0时（当地时间）
            row.date = new Date(year.toString());
            debug('row: %j', row);
        } else if (!sheets[i][col.month] || !sheets[i][col.date]) {
            errLine.push(i + 2 + '行，日期数据不完整；');
            //debug('errLine: %j', row);
            continue;
        } else {
            row.date = new Date(
                year, sheets[i][col.month] - 1, sheets[i][col.date]);
        }
        if (isNaN(row.debit) || isNaN(row.credit) || isNaN(row.balance)) {
            errLine.push(i + 2 + '行，财务统计数字有误；');
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

// 分阶段汇总数据，返回数组
function gradingList(figures, granularity, yearFrom, yearTo) {
    var grading = initGrading(granularity, yearFrom, yearTo);
    if (grading.length == 0) {
        return {status: 'paramsErr', message: '查询参数错误'};
    }
    var startDate = new Date(yearFrom, 0, 1);
    for (var i = 0, len = figures.length; i < len; i++) {
        var result = classifyRow(figures[i], startDate);
        if (result.status != 'ok') {
            return result;
        }
        var index = gradingIndex(figures[i].date, granularity, yearFrom);
        debug('index: ' + index);
        if (index == 'error') {
            console.log('异常的财务数据：没有正确的发生时间');
            continue;
        }
        // 初始化每个阶段的数据
        //if (!grading.hasOwnProperty(index)) {
        //    // end为累计发生额
        //    grading[index] = {init: 0, end: 0, credit: 0, debit: 0};
        //}
        // 处理年度结转数据
        if (figures[i].voucher.id == '10000' &&
            figures[i].date.getFullYear() == yearFrom) {
            debug('add balance from last year');
            grading[index].init += figures[i].balance;
            continue;
        }
        grading[index][result.type] += result.value;
        grading[index]['credit'] += figures[i]['credit'];
        grading[index]['debit'] += figures[i]['debit'];
    }
    // 将grading中的init值更新为上一阶段的init值与累计值之和
    for (i = 1, len = grading.length; i < len; i++) {
        grading[i].init = grading[i-1].init + grading[i-1].end;
    }
    //var data = [];
    //for (var g in grading) {
    //    if (!grading.hasOwnProperty(g)) {
    //        continue;
    //    }
    //    grading[g].name = g;
    //    data.push(grading[g]);
    //}
    //data = data.sort(function(a, b) {return a.name < b.name ? -1 : 1;});
    return {data: grading, status: 'ok', message: '成功生成按阶段逐一汇总报表'};
}

function initGrading(granularity, yearFrom, yearTo) {
    if (!parseInt(yearFrom) || !parseInt(yearTo)) {
        return [];
    }
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    if (yearFrom > yearTo || year < yearFrom) {
        return [];
    }
    if (year < yearTo) {
        yearTo = year;
    }
    var a = [];
    if (granularity == 'year') {
        for (var i = yearFrom; i <= yearTo; i++) {
            a[i - yearFrom] = {name: i, init: 0, end: 0, credit: 0, debit: 0};
        }
    } else if (granularity == 'quarter') {
        for (i = yearFrom; i <= yearTo; i++) {
            for (var j = 0; j < 4; j++) {
                // 如果是本当年度，要去除没到达的季度
                if (i == year && j * 3 > month) {
                    break;
                }
                a[(i - yearFrom) * 4 + j] = {name: i + 'Q' + (j + 1),
                    init: 0, end: 0, credit: 0, debit: 0};
            }
        }
    } else if (granularity == 'month') {
        for (i = yearFrom; i <= yearTo; i++) {
            for (j = 0; j < 12; j++) {
                // 如果是本当年度，要去除没到达的季度
                if (i == year && j > month) {
                    break;
                }
                a[(i - yearFrom) * 12 + j] = {name: i + 'M' + (j + 1),
                    init: 0, end: 0, credit: 0, debit: 0};
            }
        }
    }
    return a;
}

function gradingIndex(date, granularity, yearFrom) {
    if (!util.isDate(date) || !parseInt(yearFrom)) {
        return 'error';
    }
    var year = date.getFullYear();
    var month = date.getMonth();
    if (year < yearFrom) {
        return 'error';
    }
    var n = (year - yearFrom) * 12 + month;
    if (granularity == 'year') {
        return year - yearFrom;
    } else if (granularity == 'quarter') {
        return Math.floor(n / 3);
    } else if (granularity == 'month') {
        return n;
    }
    return 'error';
}

function gradingName(date, granularity) {
    if (!util.isDate(date)) {
        return;
    }
    var year = date.getFullYear();
    var month = date.getMonth();
    if (granularity == 'year') {
        return year;
    }
    if (granularity == 'quarter') {
        return year + 'Q' + (Math.floor(month / 3) + 1);
    }
    if (granularity == 'month') {
        month++;
        month = month < 10 ? '0' + month : '' + month;
        return year + month;
    }
}

// 生成按照项目逐一汇总的数据，每个项目一条，以数组方式返回
function projectList(figures, startDate) {
    var projects = {};
    for (var i = 0, len = figures.length; i < len; i++) {
        var result = classifyRow(figures[i], startDate);
        if (result.status != 'ok') {
            return result;
        }
        var project = figures[i].project;
        // 初始化项目数据
        if (!projects.hasOwnProperty(project)) {
            // end属性为累计发生额
            projects[project] = {init: 0, end: 0, credit: 0, debit: 0}
        }
        // 处理年度结转数据
        if (figures[i].voucher.id == '10000' &&
            figures[i].date.getFullYear() == startDate.getFullYear()) {
            debug('add balance from last year');
            projects[project].init += figures[i].balance;
            continue;
        }
        // 计算累计数
        projects[project][result.type] += result.value;
        projects[project]['credit'] += figures[i]['credit'];
        projects[project]['debit'] += figures[i]['debit'];
    }

    // 将projects改为数组形式，并在每项中加入项目名称
    var data = [];
    for (i in projects) {
        if (!projects.hasOwnProperty(i)) {
            continue;
        }
        projects[i].name = i;
        // 将end属性保存的值由累计发生额改为期末数
        projects[i].end += projects[i].init;
        data.push(projects[i])
    }
    data = data.sort(function(a, b) {return a.name < b.name ? -1 : 1;});
    return {data: data, status: 'ok', message: '成功生成按项目逐一汇总报表'};
}

// 生成pis报表的数据，以数组方式返回
function pisList(figures, startDate) {
    // 汇总子科目到上一级科目中，直到一级科目，生成科目列表并初始化或汇总相关数据
    function aggregateSubject(subjects) {
        var aggregated = {};
        var attr, newId;
        for (attr in subjects) {
            if (!subjects.hasOwnProperty(attr)) {
                continue;
            }

            for (var i = 5; i <= 9; i += 2) {
                if (attr.length >= i) {
                    newId = attr.slice(0, i - 2);
                    if (aggregated.hasOwnProperty(newId)) {
                        aggregated[newId].init += subjects[attr].init;
                        aggregated[newId].end += subjects[attr].end;
                        aggregated[newId].credit += subjects[attr].credit;
                        aggregated[newId].debit += subjects[attr].debit;
                    } else {
                        aggregated[newId] = {
                            id: newId,
                            name: lookupSubject(newId).name,
                            init: subjects[attr].init,
                            end: subjects[attr].end,
                            credit: subjects[attr].credit,
                            debit: subjects[attr].debit
                        };
                    }
                }
            }
        }
        return aggregated;
    }

    // 计算每个子科目的期初数、积累、借方累计、贷方累计
    function subjectList(figures, startDate) {
        var subjects = {};
        var id;
        for (var i = 0, len = figures.length; i < len; i++) {
            id = figures[i].subjectId;
            if (!subjects.hasOwnProperty(id)) {
                subjects[id] = {id: id, name: figures[i].subjectName,
                    init: 0, end: 0, credit: 0, debit: 0};
            }
            if (figures[i].voucher.id == '10000' &&
                figures[i].date.getFullYear() == startDate.getFullYear()) {
                debug('add balance from last year');
                subjects[id].init += figures[i].balance;
                continue;
            }
            var result = classifyRow(figures[i], startDate);
            if (result.status != 'ok') {
                return result;
            }
            subjects[id][result.type] += result.value;
            subjects[id]['credit'] += figures[i]['credit'];
            subjects[id]['debit'] += figures[i]['debit'];
        }
        return subjects;
    }

    var subjects = subjectList(figures, startDate);
    var aggregated = objectToArray(aggregateSubject(subjects));
    //debug('aggregated: ' + JSON.stringify(aggregated));
    subjects = objectToArray(subjects);
    //debug('subjects: ' + JSON.stringify(subjects));
    subjects = aggregated.concat(subjects).sort(function(a, b) {
        return a.id < b.id ? -1 : 1;
    });

    // 将end属性保存的值由累计改为期末数
    for (var i = 0; i < subjects.length; i++) {
        subjects[i].end += subjects[i].init;
    }
    return {data: subjects, status: 'ok', message: '成功生成pis报表'};
}


// 分析每行数据的内容，以适当处理
function classifyRow(row, date) {
    var sum;
    if (row.direction == '借') {
        sum = row.debit - row.credit;
    } else if (row.direction == '贷') {
        sum = row.credit - row.debit;
    } else if (row.direction == '平') {
        if (row.credit != 0 && row.debit != 0) {
            return {status: 'errEqual', message: '平帐数据有误'};
        }
        sum = row.credit + row.debit;
    } else {
        return {status: 'errDirection', message: '借贷方向有误'};
    }
    // init表示对应到初始值中，end表示对应到最终累计数中
    var point = row.date < date ? 'init' : 'end';
    return {status: 'ok', type: point, value: sum};
}

// 由科目代码查询科目名称
function lookupSubject(subjectId) {
    var g1 = subjectId.slice(0, 3),
        g2 = subjectId.slice(0, 5),
        g3 = subjectId.slice(0, 7),
        g4 = subjectId.slice(0, 9);
    var subject = {};
    //debug('subjectMap: %j', subjectMap);
    if (subject && subjectId.length >= 3) {
        subject = subjectMap[g1];
        //debug('subject level 1: %j', subject);
    }
    if (subject && subjectId.length >= 5) {
        subject = subject[g2];
        //debug('subject level 2: %j', subject);
    }
    if (subject && subjectId.length >= 7) {
        subject = subject[g3];
    }
    if (subject && subjectId.length >= 9) {
        subject = subject[g4];
    }
    if (!subject) {
        subject = {name: '未知科目', direction: '未知'}
    }
    return {name: subject.name, direction: subject.direction};
}

// 将对象转换为由其属性值组成的数组
function objectToArray(obj) {
    var keys = Object.keys(obj);
    var a = [];
    for (var i = 0, len = keys.length; i < len; i++) {
        a.push(obj[keys[i]]);
    }
    return a;
}

// 由指定参数获取路径，并读取文件
function readFile(relativePath, callback) {
    //var filePath = voucherFilePath(params);
    var filePath = path.join(__dirname, refPath.voucher, '..', relativePath);
    debug('file path: ' + filePath);

    fs.readFile(filePath, function(err ,data) {
        if (err) {
            callback({status: 'errReadFile', target: relativePath,
                message: '无法读取文件'});
            return;
        }
        callback({data: data, status: 'ok', target: relativePath,
            message: '成功读取文件'});
    });
}

// 由传入对象的date, voucher属性获取对应文件路径
// 路径格式为：配置的凭证路径/年/月/凭证对于pdf文件
function voucherFilePath(params) {
    var date = new Date(params.date);
    var year = '';
    var month = '';
    if (date.toString() != 'Invalid Date') {
        year = date.getFullYear().toString();
        month = date.getMonth() + 1;
        month = month > 9 ? '' + month : '0' + month;
        date = year + month;
    } else {
        date = '';
    }
    //debug('date: ' + date);
    //var project = params.project;
    //debug('project: ' + project);
    var voucherId = params.voucherId;
    if (params.voucher && params.voucher.id) {
        voucherId = params.voucher.id;
    }
    var voucher = decodeURIComponent(voucherId);
    voucher = voucher.replace('-', '');
    //debug('voucher id: ' + voucher);
    if (!date || !voucher) {
        return '';
    }
    return path.join(__dirname, refPath.voucher, year, month,
        date + '-' + voucher + '.pdf');
    //debug('path: ' + path.join(__dirname, refPath.voucher,
    //    date, project, voucher + '.pdf'));
    //return path.join(__dirname, refPath.voucher,
    //    date, project, voucher + '.pdf');
}

// 生成凭证唯一ID号
function figureId(row) {
    var date = row.date.getFullYear() + '' +
        row.date.getMonth() + row.date.getDate();
    var p1 = row.voucher.id.toString().split('-');
    p1 = date + (p1[1] === undefined ? p1[0] : p1[1]);
    var p2 = row.subjectId + '' + Math.round(Math.abs(row.balance) * 100);
    return parseInt(p1).toString(36) + parseInt(p2).toString(36);
}

// 将docs中的数据与凭证电子文件进行关联
// 回调函数格式为callback(message)
function voucherAutoBind(db, docs, alarm, rewrite, callback) {
    //debug('docs: %j', docs);
    //var figures = docs.sort(function(a, b) {
    //    if (a.voucher.id != b.voucher.id) {
    //        return a.voucher.id > b.voucher.id ? 1 : -1;
    //    }
    //    if (a.date != b.date) {
    //        return a.date > b.date ? 1 : -1;
    //    }
    //    if (a.project != b.project) {
    //        return a.project > b.project ? 1 : -1;
    //    }
    //    if (a.subjectId != b.subjectId) {
    //        return a.subjectId > b.subjectId ? 1 : -1;
    //    }
    //    return 0;
    //});
    //debug('figures sorted: %j', figures);
    //figures = candidateFigure(figures);
    //debug('figures classified: %j', figures);
    //var candidates = figures['candidates'];
    //var duplicates = figures['duplicates'];
    var noVouchers = [];
    var dbSaveErrs = [];
    var count = 0;
    var i, len, filePath;
    for (i = 0, len = docs.length; i < len; i++) {
        if (docs[i].voucher.path && !rewrite) {
            continue;
        }
        filePath = voucherFilePath(docs[i]);
        debug('filePath: %s', filePath);
        count++;
        fs.exists(filePath, bindPath(i, filePath));
    }

    function bindPath(i, filePath) {
        return function(exist) {
            var voucher = {id: docs[i].voucher.id};
            voucher.path = '';
            if (!exist) {
                if (!alarm || !docs[i].voucher.path) {
                    noVouchers.push(docs[i]);
                }
                //count--;
                //if (count == 0) {
                //    callback({
                //        noVouchers: noVouchers,
                //        dbSaveErrs: dbSaveErrs
                //    });
                //}
                console.log('bind count without vouchers: ' + count);
            } else {
                var baseDir = path.join(__dirname, refPath.voucher, '..');
                voucher.path = path.relative(baseDir,  filePath);
            }

            debug('save path: ' + filePath);
            debug('voucher id: ' + docs[i].voucher.id);
            db.save('figure', {id: docs[i].id}, {voucher: voucher},
                function(err) {
                    if (err) {
                        console.log('db write error: ' + JSON.stringify(err));
                        if (!alarm || !docs[i].voucher.path) {
                            dbSaveErrs.push(docs[i]);
                        }
                    }
                    count--;
                    console.log('bind count after save: ' + count);
                    if (count == 0) {
                        callback({
                            noVouchers: noVouchers,
                            dbSaveErrs: dbSaveErrs
                        });
                    }
                });
        };
    }
}

// 将docs中的数据与凭证电子文件进行关联
// 回调函数格式为callback(message)
function voucherAutoBindBk(db, docs, alarm, rewrite, callback) {
    //debug('docs: %j', docs);
    var figures = docs.sort(function(a, b) {
        if (a.voucher.id != b.voucher.id) {
            return a.voucher.id > b.voucher.id ? 1 : -1;
        }
        if (a.date != b.date) {
            return a.date > b.date ? 1 : -1;
        }
        if (a.project != b.project) {
            return a.project > b.project ? 1 : -1;
        }
        if (a.subjectId != b.subjectId) {
            return a.subjectId > b.subjectId ? 1 : -1;
        }
        return 0;
    });
    //debug('figures sorted: %j', figures);
    figures = candidateFigure(figures);
    //debug('figures classified: %j', figures);
    var candidates = figures['candidates'];
    var duplicates = figures['duplicates'];
    var noVouchers = [];
    var dbSaveErrs = [];
    var count = 0;
    var i, len, filePath;

    function bindPath(i, filePath) {
        return function(exist) {
            if (!exist) {
                if (!alarm || !candidates[i].voucher.path) {
                    noVouchers.push(candidates[i]);
                }
                count--;
                if (count == 0) {
                    callback({
                        duplicates: duplicates,
                        noVouchers: noVouchers,
                        dbSaveErrs: dbSaveErrs
                    });
                }
                console.log('bind count without save: ' + count);
                return;
            }
            var voucher = {id: candidates[i].voucher.id};
            var baseDir = path.join(__dirname, refPath.voucher, '..');
            voucher.path = path.relative(baseDir,  filePath);
            debug('save path: ' + filePath);
            debug('voucher id: ' + candidates[i].voucher.id);
            db.save('figure', {id: candidates[i].id}, {voucher: voucher},
                function(err) {
                    if (err) {
                        console.log('db write error: ' + JSON.stringify(err));
                        if (!alarm || !candidates[i].voucher.path) {
                            dbSaveErrs.push(candidates[i]);
                        }
                    }
                    count--;
                    console.log('bind count after save: ' + count);
                    if (count == 0) {
                        callback({
                            duplicates: duplicates,
                            noVouchers: noVouchers,
                            dbSaveErrs: dbSaveErrs
                        });
                    }
                });
        };
    }

    for (i = 0, len = candidates.length; i < len; i++) {
        if (candidates[i].voucher.path && !rewrite) {
            continue;
        }
        filePath = voucherFilePath(candidates[i]);
        debug('filePath: %s', filePath);
        count++;
        fs.exists(filePath, bindPath(i, filePath));
    }
    //callback({status: 'ok', message: '凭证电子文档与财务数据关联成功'});
}

// 用于过滤有多个条目凭证ID相同的情况，该功能暂不使用
function candidateFigure(figures) {
    var candidates = [];
    var duplicates = [];
    var i, j;
    var len = figures.length;
    for (i = 0; i < len; i = j) {
        for (j = i + 1; j < len; j++) {
            if (figures[i].date != figures[j].date ||
                figures[i].project != figures[j].project ||
                figures[i].voucher.id != figures[j].voucher.id ||
                figures[i].subjectId != figures[j].subjectId) {
                break;
            }
        }
        if (i + 1 == j) {
            candidates.push(figures[i]);
        } else {
            duplicates.push(figures[i]);
        }
    }
    return {candidates: candidates, duplicates: duplicates};
}

module.exports = {
    subject: subjectMap,
    banPdf: banPdf,
    log: log,
    period: period,
    importFigures: importFigures,
    interval: interval,
    figureId: figureId,
    pisList: pisList,
    readFile: readFile,
    objectToArray: objectToArray,
    voucherAutoBind: voucherAutoBind,
    listFiles: listFiles,
    projectList: projectList,
    gradingList: gradingList
};