// 从配置文件读取内置账号
var builtinAccount = require('../config').builtinAccount;
// 存放用户注册序列号的位置
var customerIdPath = '../../staticData/customerId';

var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');


// 对两个参数代表的账号进行比对，如果一致，则返回真值
function auth(acc, stdAcc) {
    // 与系统中的账号进行比对
    if (stdAcc) {
        return acc && stdAcc.enabled &&
            acc.username == stdAcc.username &&
            acc.password == stdAcc.password;
    }
    // 与内置账号进行比对
    return acc && builtinAccount.enabled &&
        acc.username == builtinAccount.username &&
        acc.password == builtinAccount.password;
}

// 检测acc对应账号的权限是否满足rights对应的权限，是则返回真值
function allow(acc, rights) {
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

//////////////////////////////////////////////////////////////
// 以下函数用于系统安装运行时的注册验证版权

// 通过cpuID和网卡mac地址生成服务器ID
function createServerId() {
    var command = ['wmic cpu get processorId', 'wmic nic get macaddress'];
    var serverId = {};
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

// 将服务器唯一ID转换为字符串
function serverIdString(sId) {
    if (!sId || !sId.cpuId || !sId.macAddress || sId.macAddress.length == 0) {
        console.log('server Id error ', sId);
    }
    var idString = sId.macAddress.join('-');
    idString += '-' + sId.cpuId;
    console.log(idString);
    return idString;
}

// 将CPU信息加密
function hashCpuId(cpuId) {
    cpuId += cpuId + cpuId + cpuId;
    var hashCpuId = crypto.createHash('sha256');
    hashCpuId.update(cpuId);
    return hashCpuId.digest('hex');
}

// 将网卡mac地址加密
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

// 将用户注册序列号写入特定文件，callback(err)
function saveCustomerId(cId, callback) {
    var cIdPath = path.join(__dirname, customerIdPath);
    fs.writeFile(cIdPath, cId, callback);
}

// 将用户注册序列号从特定文件读出
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

// 验证cpuId，这里的cpuId并非全球唯一Id，类似于cpu型号Id
function verifyCpuId(serverId, customerId) {
    if (!customerId || !serverId || !serverId.cpuId) {
        return false;
    }
    var customerCpuId = customerId.split('\n').pop();
    return customerCpuId == hashCpuId(serverId.cpuId);
}

// 验证mac地址，只要有一个mac地址符合，即通过验证
function verifyMacAddress(serverId, customerId) {
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

// 将服务器唯一Id转换为序列号
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

// 暂未使用，用户同时验证cpuId和mac地址
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

var sId = createServerId();
setTimeout(function() {console.log(sId)}, 2000);
setTimeout(function() {console.log(createCustomerId(serverIdString(sId)))}, 2000);


module.exports = {
    auth: auth,
    allow: allow,
    builtinUser: builtinAccount,
    serverId: createServerId(),
    customerId: getCustomerId(),
    serverIdString: serverIdString,
    saveCustomerId: saveCustomerId,
    verifyCpuId: verifyCpuId,
    verifyMacAddress: verifyMacAddress
};