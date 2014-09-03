// 此处设置web服务的端口号
var httpPort = 23456;         // 蓝山所用端口号


// 此处设置web服务使用环境，可以是开发环境或生产环境
//var runningEnvironment = 'development';
var runningEnvironment = 'productivity';

// 此处设置系统读取的静态数据
var county = 'lanShan';

// 此处修改内置管理员账号的名称和密码等信息
var builtinAccount = {
    username: 'admin',            // 管理员名称
    password: 'admin',            // 管理员密码
    area: '0',
    permission: '管理员',
    type: 'independent'
};

// 此处设定mongodb数据库服务器的参数：链接地址、端口、数据库
var dbServer = {
    address: 'localhost:',
    port: '27017',
    dbName: 'chequesys'           // 数据库名称
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'chequesys',           // 数据库连接用户名称
    pass: 'letmein',             // 数据库连接用户密码
    server: {socketOptions: {keepAlive: 1}}
};

// 对查询数据库结果数目作出限制，以保证系统性能，避免假死
var queryLimit = 100000;

module.exports = {
    port: httpPort,
    runningEnv: runningEnvironment,
    county: county,
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    },
    queryLimit: queryLimit
};