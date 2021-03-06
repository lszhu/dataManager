﻿// 此处设置web服务的端口号
var httpPort = 23456;

// 此处设置web服务使用环境，可以是开发环境或生产环境
var runningEnvironment = 'development';
//var runningEnvironment = 'productivity';

// 此处设置系统唯一标识，可用于一个服务器安装多个服务
var sysId = 'chequeSys01';

// 常规电子档案存放位置，建议用相对路径
var archivePath = '../../../archive';

// 存放合同文件的路径，建议用相对路径
var contractPath = '../../../contract';

// 存放凭证文件的路径，建议用相对路径
var voucherPath = '../../../pdf';

// 存放普通文件的路径，建议用相对路径
var filePath = '../../../file';

// 存放用于导入系统数据库的凭证数据文件的根目录，建议用绝对路径
var importPath = 'E:/web/chequeSys/pdf/用友数据';

// 此处修改内置管理员账号的名称和密码等信息
var builtinAccount = {
    username: 'admin',            // 管理员名称
    password: 'admin',            // 管理员密码
    groups: ['administrator'],    // 管理员所属组号
    rights: 'administrator', //{},             // 除组规定的权限外的额外权限
    enabled: true,                // 启用状态
    description : 'builtin administrator'
};

// 此处设定mongodb数据库服务器的参数：链接地址、端口、数据库
var dbServer = {
    address: 'localhost:',        // 数据库服务器地址
    port: '27017',                // 数据库服务端口
    dbName: 'chequesys'           // 数据库名称
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'chequesys',            // 数据库连接用户名称
    pass: 'chequeSys2014',        // 数据库连接用户密码
    server: {
        socketOptions: {keepAlive: 1},
        auto_reconnect: false     // 请不要修改此参数
    }
};

// 对查询数据库结果数目作出限制，以保证系统性能，避免假死
var queryLimit = 100000;

module.exports = {
    port: httpPort,
    runningEnv: runningEnvironment,
    sysId: sysId,
    path: {
        archive: archivePath,
        contract: contractPath,
        voucher: voucherPath,
        file: filePath,
        base: importPath
    },
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    },
    queryLimit: queryLimit
};