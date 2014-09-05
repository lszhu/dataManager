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
});

var PersonMsg = mongoose.model('hrmsg', personSchema);

var projectSchema = new Schema({
    id: Number,
    name: String,
    description: String,
    contract: [{
        name: String,
        path: String,
        store: String,
        date: Date,
        destroyed: Boolean
    }]
});

var figuresSchema = new Schema({
    project: Number,
    date: Date,
    voucher: {
        id: String,
        path: String,
        store: String
    },
    subject: String,
    comment: String,
    debit: Number,
    credit: Number,
    direction: String,
    balance: String,
    deleted: Boolean
});

var logSchema = new Schema({
    time: Date,
    operator: String,
    operation: String,
    target: String,
    status: String
});

var accountSchema = new Schema({
    username: String,
    password: String,
    group: String,
    permission: Object,
    enabled: String,
    description: String
});

var lendingSchema = new Schema({
    time: Date,
    borrower: String,
    target: String,
    reason: String,
    retrieve: Date,
    comment: String
});

var rightsSchema = new Schema({
    projects: [Number],
    subjects: [String],
    date: {
        begin: Date,
        end: Date
    },
    figures: Boolean,
    voucher: Boolean,
    contract: Boolean,
    archive: Boolean,
    destroy: Boolean,
    approval: Boolean,
    lending: {
        voucher: Boolean,
        contract: Boolean
    }
});

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


var Account = mongoose.model('account', accountSchema);

// save account information
function saveAccount(acc) {
    Account.update({username: acc.username}, acc, {upsert: true},
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
    getAccount: getAccount
};