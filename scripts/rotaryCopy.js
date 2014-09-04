require('shelljs/global');
var fs = require('fs');

var maxDir = 60;
var originDir = 'D:\\hrSys\\dataBackup';
var savedDir = 'D:\\hrSys\\dataBackupSaved';
var storeDir = 'J:\\hrSysBackup';

function originToSaved() {
    if (fs.existsSync(originDir)) {
        var files = ls(originDir);
        if (files.length >= 1) {
            if (fs.existsSync(savedDir)) {
                rm('-rf', savedDir);
            }
            mv('-f', originDir, savedDir);
            mkdir('-p', originDir);
            // need call rotaryCopy
            return true;
        }
    }
    // do not need rotaryCopy
    return false
}

function rotaryCopy() {
    if (!fs.existsSync(storeDir)) {
        mkdir('-p', storeDir);
    }
    if (fs.existsSync(storeDir + '\\bk60')) {
        rm('-rf', storeDir + '\\bk60');
    }
    for (var i = maxDir - 1; 0 < i; i--) {
        if (fs.existsSync(storeDir + '\\bk' + i)) {
            mv('-f', storeDir + '\\bk' + i, storeDir + '\\bk' + (i + 1));
        }
    }
    mkdir('-p', storeDir + '\\bk1');
    cp('-Rf', savedDir + '\\*', storeDir + '\\bk1');
}

if (originToSaved()) {
    rotaryCopy();
}
