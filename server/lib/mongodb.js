var debug = require('debug')('db');
// mongodb server parameters
var db = require('../config').db;
// Specifies the maximum number of documents the query will return
var maxReturnedDoc = require('../config').queryLimit;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://' + db.server.address + ':' +
    db.server.port + '/' + db.server.dbName, db.parameter);

mongoose.connection.on('error', function(err) {
    console.error('connection error:', err);
    // if connection failed, retry after 10s
    setTimeout(function() {
        mongoose.connect('mongodb://' + db.server.address + ':' +
            db.server.port + '/' + db.server.dbName, db.parameter);
    }, 10000);
});
mongoose.connection.once('open', function() {
    console.log('database connected.');
});

var personSchema = new Schema({
    // basic info
    username: String,
    idNumber: String,
    nation: String,
    address: {
        county: String,
        town: String,
        village: String
    },
    districtId: String,
    postService: [String],
    extraPostService: String,
    // employment/unemployment switch
    employment: String,
    // employment info
    employmentInfo: {
        workProvince: String,
        salary: Number,
        jobForm: String
    },
    // unemployment info
    unemploymentInfo: {
        unemploymentCause: String,
        familyType: String,
        preferredJobType: [String]
    },
    // insurance info
    insurance: [String],
    // editor info
    editor: String,
    modifiedDate: Date
});

var PersonMsg = mongoose.model('hrmsg', personSchema);

function save(hrMsg) {
    PersonMsg.update(
        {idNumber: hrMsg.idNumber},
        hrMsg,
        {upsert: true},
        function(err) {
            if (err) {
                console.error('save error: \n%o', err);
            }
        });
}

function query(condition, callback) {
    PersonMsg.find(condition)
        .lean()         // make return value changeable
        .limit(maxReturnedDoc)  // limit returned documents
        //.sort({districtId: 1, username: 1})
        .exec(callback);
}

function search(condition, district, callback) {
    var query = PersonMsg.find(condition).read('primary');
    query.where(district)
        .lean()         // make return value changeable
        .limit(maxReturnedDoc)  // limit returned documents
        //.sort({districtId: 1, username: 1})
        .exec(callback);
}

function update(condition, value, callback) {
    PersonMsg.update(condition, value, {multi: true}, callback);
}

function remove(condition, callback) {
    PersonMsg.remove(condition, callback);
}

function preprocessUserMsg(userMsg) {
    //userMsg.address = getAddress(userMsg.administrator);
    if (userMsg.employment == '已就业') {
        userMsg.unemploymentInfo = null;
    } else {
        userMsg.employmentInfo = null;
    }
}

function count(districtId, callback) {
    PersonMsg.count({districtId: districtId}, function(e, c) {
        if (e) {
            console.log('DataBase access error.');
            callback(districtId, 0);
            return;
        }
        callback(districtId, c);
    });
}

function multiCount(list, callback) {
    var result = {};
    // to count the running count processes
    var counting = 0;

    for (var i = 0; i < list.length; i++) {
        counting++;
        count(list[i], function(districtId, c) {
            counting--;
            result[districtId] = c;
            if (counting == 0) {
                callback(result);
            }
        });
    }
}

var accountSchema = new Schema({
    username: String,
    password: String,
    enabled: Boolean,
    area: String,
    permission: String,
    // type can be 'independent' or 'bound'
    type: String
});

var Account = mongoose.model('account', accountSchema);

// save account information
function saveAccount(acc) {
    Account.update(
        {username: acc.username},
        acc,
        {upsert: true},
        function(err) {
            if (err) {
                console.error('save error: \n%o', err);
            }
        });
}

// change account status
function changeAccountStatus(user, status) {
    Account.update({username: user}, {enabled: status}, function(err) {
        if (err) {
            console.error('save error: \n%o', err);
        }
    });
}

// change account password
function changeAccountPassword(user, password, callback) {
    Account.update({username: user}, {password: password}, callback);
}

// delete account
function deleteAccount(user) {
    Account.remove({username: user}, function(err) {
        if (err) {
            console.error('save error: \n%o', err);
        }
    });
}

// query accounts information
function queryAccounts(condition, callback) {
    Account.find(condition)
        .lean()         // make return value changeable
        .sort('username')
        .exec(callback);
}

// get account information
function getAccount(username, callback) {
    Account.findOne({username: username}, callback);
}

// batch initiate bound account with district ID
function batchInitAccount(districts, countyId, callback) {
    var error = false;
    var count = 0;
    for (var town in districts[countyId]) {
        debug('townId: ' + town);
        if (!districts[countyId].hasOwnProperty(town)) {
            continue;
        }
        // town level account
        var account = {
            username: town,
            password: Date.now().toString(),
            enabled: false,
            area: town,
            permission: '只读',
            type: 'bound'
        };
        // used to count in doing update
        count++;
        Account.update(
            {username: town},
            account,
            {upsert: true},
            function(err) {
                return err ? (error = err) : count--;
            }
        );
        for (var village in districts[town]) {
            debug('villageId: ' + village);
            if (!districts[town].hasOwnProperty(village)) {
                continue;
            }
            // village level account
            account = {
                username: village,
                password: Date.now().toString(),
                enabled: false,
                area: village,
                permission: '只读',
                type: 'bound'
            };
            // used to count in doing update
            count++;
            Account.update(
                {username: village},
                account,
                {upsert: true},
                function(err) {
                    return err ? (error = err) : count--;
                }
            );
        }
    }
    // access DB timeout is 3s
    var timeout = 3000;
    // check DB update result every 0.1s
    setTimeout(result, 100);
    function result() {
        if (count == 0) {
            return callback();
        }
        if (timeout <  0) {
            return callback('dbAccessTimeout');
        }
        timeout -= 100;
        setTimeout(result, 100);
    }

}

// batch initiate bound account with district ID
function batchInitPassword(password, callback) {
    Account.update(
        {type: 'bound'},
        {password: password},
        {multi: true},
        callback
    );
}

// batch initiate bound account with district ID
function batchChangePermission(permission, callback) {
    Account.update(
        {type: 'bound'},
        {permission: permission},
        {multi: true},
        callback);
}

// batch initiate bound account with district ID
function batchChangeStatus(status, callback) {
    Account.update(
        {type: 'bound'},
        {enabled: status},
        {multi: true},
        callback);
}

module.exports = {
    save: save,
    query: query,
    remove: remove,
    update: update,
    count: count,
    multiCount: multiCount,
    preprocessUserMsg: preprocessUserMsg,
    saveAccount: saveAccount,
    changeAccountStatus: changeAccountStatus,
    changeAccountPassword: changeAccountPassword,
    deleteAccount: deleteAccount,
    queryAccounts: queryAccounts,
    getAccount: getAccount,
    batchInitAccount: batchInitAccount,
    batchInitPassword: batchInitPassword,
    batchChangePermission: batchChangePermission,
    batchChangeStatus: batchChangeStatus
};