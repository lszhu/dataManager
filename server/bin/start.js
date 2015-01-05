var forever = require('forever-monitor');

var child = new (forever.Monitor)('www', {
    uid: 'chequeSys',
    silent: true,
    args: [],
    logFile: 'chequeSys.log'
});

child.on('exit', function () {
    console.log('your-filename.js has exited after 3 restarts');
});

child.start();