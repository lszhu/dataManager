// 从配置文件读取内置账号
var builtinAccount = require('../config').builtinAccount;

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
    if (acc.rights == 'readonly') {
        return rights == 'readonly';
    } else if (acc.rights == 'readWrite') {
        return rights == 'readonly' || rights == 'readWrite';
    } else if (acc.rights == 'administrator') {
        return true;
    }
    return false;
}

module.exports = {
    auth: auth,
    allow: allow,
    builtinUser: builtinAccount
};