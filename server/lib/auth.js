
var builtinAccount = require('../config').builtinAccount;

var customerIdPath = '../../staticData/customerId';

var debug = require('debug')('auth');
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');


var serverId = createServerId();
var customerId = getCustomerId();



function auth(acc, stdAcc) {

    if (stdAcc) {
        return acc && stdAcc.enabled &&
            acc.username == stdAcc.username &&
            acc.password == stdAcc.password;
    }

    return acc && builtinAccount.enabled &&
        acc.username == builtinAccount.username &&
        acc.password == builtinAccount.password;
}


function testRights(acc, rights) {
    var permission = {
        readonly: 1,
        readPlus: 2,
        readWrite: 3,
        administrator: 4
    };
    var accRights = permission[acc.rights];
    accRights = accRights ? accRights : 0;
    var stdRights = permission[rights];
    stdRights = stdRights ? stdRights : 0;
    return accRights >= stdRights;

    //if (acc.rights == 'readonly') {
    //    return rights == 'readonly';
    //} else if (acc.rights == 'readPlus') {
    //    return rights == 'readonly' || rights == 'readPlus';
    //} else if (acc.rights == 'readWrite') {
    //    return rights == 'readonly' ||
    //        rights == 'readPlus || rights == 'readWrite';
    //} else if (acc.rights == 'administrator') {
    //    return true;
    //}
    //return false;
}


function allow(acc, rights) {
    if (!testRights(acc, rights)) {
        return false;
    }

    //console.log('serverId: ' + serverId);
    //console.log('customerId: ' + customerId);
    var auth1 = verifyCpuId(serverId, customerId);
    var auth2 = verifyMacAddress(serverId, customerId);
    return auth1 && auth2;
}


function createServerId() {
    var command = ['wmic cpu get processorId', 'wmic nic get macaddress'];
    var serverId = {};
    //var childProcess = require('child_process');
    childProcess.exec(command[0], function(err, stdout, stderr) {
        if (err) {
            console.log('create server Id error(run) ', err);
            process.exit(1);
        }
        if (stderr) {
            console.log('create server Id error(output) ', stderr);
            process.exit(2);
        }
        var re = /[0-9A-F]{16}/i;
        //console.log('cpuId' + stdout.match(re)[0]);
        serverId.cpuId = stdout.match(re)[0];
    });
    childProcess.exec(command[1], function(err, stdout, stderr) {
        if (err) {
            console.log('create server Id error(run) ', err);
            process.exit(1);
        }
        if (stderr) {
            console.log('create server Id error(output) ', stderr);
            process.exit(2);
        }
        var re = /([0-9A-F]{2}:){5}[0-9A-F]{2}/gi;
        //console.log('macaddress: ', stdout.match(re));
        serverId.macAddress = stdout.match(re);
        serverId.macAddress = serverId.macAddress.filter(function(e) {
            return e != '20:41:53:59:4E:FF' && !(/^00:50:56/).test(e);
        });
        serverId.macAddress  = serverId.macAddress
            .join('-').replace(/:/gm, '').split('-');
    });
    return serverId;
}


function serverIdString(sId) {
    if (!sId || !sId.cpuId || !sId.macAddress || sId.macAddress.length == 0) {
        console.log('server Id error ', sId);
    }
    var idString = sId.macAddress.join('-');
    idString += '-' + sId.cpuId;
    //console.log(idString);
    return idString;
}


function hashCpuId(cpuId) {
    cpuId += cpuId + cpuId + cpuId;
    var hashCpuId = crypto.createHash('sha256');
    hashCpuId.update(cpuId);
    return hashCpuId.digest('hex');
}


function hashMacAddress(macList) {
    var hashMac = [];
    var hashMacAddress, MacAddress;
    for (var i = 0; i < macList.length; i++) {
        MacAddress =
            macList[i] + macList[i] + macList[i] + macList[i] + macList[i];
        hashMacAddress = crypto.createHash('sha256');
        hashMacAddress.update(MacAddress);
        hashMac.push(hashMacAddress.digest('hex'));
    }
    return hashMac;
}


function saveCustomerId(cId, callback) {
    var cIdPath = path.join(__dirname, customerIdPath);
    customerId = cId;
    fs.writeFile(cIdPath, cId, callback);
}


function getCustomerId() {
    var cIdPath = path.join(__dirname, customerIdPath);
    var customerId;
    try {
        customerId = fs.readFileSync(cIdPath, {encoding: 'utf8'});
    } catch (e) {
        return '';
    }
    //customerId.replace(/\n/g, '-');
    return customerId;
}


function verifyCpuId(serverId, customerId) {
    var year = getYear(customerId);
    var month = getMonth(customerId);
    if (year && month) {
        var curDate = new Date();
        var regDate = new Date(year, month - 1, 31);
        if (curDate < regDate) {
            return true;
        }
    }
    if (!customerId || !serverId || !serverId.cpuId) {
        return false;
    }
    var customerCpuId = customerId.split('\n').pop();
    return customerCpuId == hashCpuId(serverId.cpuId);
}


function verifyMacAddress(serverId, customerId) {
    var year = getYear(customerId);
    var month = getMonth(customerId);
    if (year && month) {
        var curDate = new Date();
        var regDate = new Date(year, month - 1, 31);
        if (curDate < regDate) {
            return true;
        }
    }
    if (!customerId || !serverId || !serverId.macAddress) {
        return false;
    }
    customerId = customerId.split('\n');
    customerId.pop();
    var hashedMacAddress = hashMacAddress(serverId.macAddress);
    for (var i = 0; i < hashedMacAddress.length; i++) {
        if (customerId.some(function(e) {return e == hashedMacAddress[i];})) {
            return true;
        }
    }
    return false;
}


function getYear(customerId) {
    if (!customerId) {
        return 0;
    }
    customerId = customerId.split('\n');
    if (customerId.length != 2) {
        return 0;
    }
    var curYear = (new Date()).getFullYear();
    var hashedYear = customerId[0];
    var hashedYears = hashYear();
    if (hashedYear == hashedYears[0]) {
        debug('year: ' + curYear);
        return curYear;
    } else if (hashedYear == hashedYears[1]) {
        debug('year: ' + curYear);
        return curYear + 1;
    }
    debug('year: ' + 0);
    return 0;
}


function getMonth(customerId) {
    if (!customerId) {
        return 0;
    }
    customerId = customerId.split('\n');
    if (customerId.length != 2) {
        return 0;
    }
    var hashedMonth = customerId[1];
    var hashedMonthList = hashMonth();
    for (var i = 0; i < 12; i++) {
        if (hashedMonthList[i] == hashedMonth) {
            debug('month: ' + (i + 1));
            return i + 1;
        }
    }
    debug('month: ' + 0);
    return 0;
}


function createCustomerId(sIdString) {
    if (!sIdString) {
        console.log('error server Id');
        return;
    }
    var ids = sIdString.split('-');
    var cpuId = ids.pop();
    if (!cpuId) {
        console.log('error server Id');
    }
    var hashedCpuId = hashCpuId(cpuId);
    //console.log('hashCpuId: ' + hashCpuId);
    if (ids.length == 0) {
        console.log('error server Id');
    }
    var hashMac = hashMacAddress(ids);
    hashMac.push(hashedCpuId);
    //console.log('hashMac: ', hashMac);
    return hashMac.join('\n');
}


function verifyCustomerId(serverId, customerId) {
    if (!customerId || !serverId || !serverId.cpuId || !serverId.macAddress) {
        return false;
    }
    customerId = customerId.split('-');
    var customerCpuId = customerId.pop();
    if (customerCpuId != hashCpuId(serverId.cpuId)) {
        return false;
    }
    var hashedMacAddress = hashMacAddress(serverId.macAddress);
    for (var i = 0; i < hashedMacAddress.length; i++) {
        if (customerId.some(function(e) {return e == hashedMacAddress[i];})) {
            return true;
        }
    }
}

function hashMonth() {
    var month = [];
    var i, j, tmp, hash;
    for (i = 1; i < 13; i++) {
        tmp = '';
        for (j = 0; j < 32; j++) {
            tmp += i < 10 ? '0' + i : '' + i;
        }
        hash = crypto.createHash('sha256');
        hash.update(tmp);
        month.push(hash.digest('hex'));
    }
    debug('month: ' + month);
    return month;
}

function hashYear() {
    var hashYears = [];
    var year = (new Date()).getFullYear();
    var tmp, i;
    for (i = 0, tmp = ''; i < 16; i++) {
        tmp += year;
    }
    var hash = crypto.createHash('sha256');
    hash.update(tmp);
    hashYears.push(hash.digest('hex'));
    year++;
    for (i = 0, tmp = ''; i < 16; i++) {
        tmp += year;
    }
    hash = crypto.createHash('sha256');
    hash.update(tmp);
    hashYears.push(hash.digest('hex'));
    debug('year: ' + hashYears);
    return hashYears;
}


module.exports = {
    auth: auth,
    allow: allow,
    builtinUser: builtinAccount,
    serverId: serverId,
    customerId: customerId,
    getCustomer: getCustomerId,
    serverIdString: serverIdString,
    saveCustomerId: saveCustomerId,
    verifyCpuId: verifyCpuId,
    verifyMacAddress: verifyMacAddress,
    testRights: testRights
};