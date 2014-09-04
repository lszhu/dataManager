// 从配置文件读取内置账号
var builtinAccount = require('../config').builtinAccount;

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

module.exports = {
    auth: auth,
    builtinUser: builtinAccount
};