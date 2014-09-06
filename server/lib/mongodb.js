var mongoose = require('mongoose');
var debug = require('debug')('mongodb');

// mongodb server parameters
var db = require('../config').db;
// Specifies the maximum number of documents the query will return
var maxReturnedDoc = require('../config').queryLimit;

// initiate a connection to mongodb
function connectDb() {
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
}

// create collection models
function createModels() {
    var archiveSchema = new mongoose.Schema({
        id: String,
        name: String,
        path: String,
        store: Number,
        date: Date,
        destroyed: Boolean,
        lending: {
            borrower: String,
            time: Date
        },
        editor: String
    });

    var storeSchema = new mongoose.Schema({
        id: Number,
        room: {
            id: Number,
            name: String
        },
        cabinet: {
            id: Number,
            name: String
        },
        folder: {
            id: Number,
            name: String
        },
        description: String,
        date: Date,
        operator: String
    });

    var projectSchema = new mongoose.Schema({
        id: Number,
        name: String,
        description: String,
        contract: [{
            id: String,
            name: String,
            path: String,
            store: String,
            date: Date,
            destroyed: Boolean
        }],
        file: [{
            id: String,
            name: String,
            path: String,
            store: String,
            date: Date,
            destroyed: Boolean
        }]
    });

    var figureSchema = new mongoose.Schema({
        id: String,
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

    var logSchema = new mongoose.Schema({
        time: Date,
        operator: String,
        operation: String,
        target: String,
        status: String
    });

    var accountSchema = new mongoose.Schema({
        username: String,
        password: String,
        enabled: String,
        description: String,
        groups: [String],
        rights: {
            system: {
                log: Boolean,
                account: Boolean,
                group: Boolean
            },
            projects: Boolean,
            subjects: Boolean,
            date: {
                begin: Boolean,
                end: Boolean
            },
            figures: {
                readable: Boolean,
                removable: Boolean
            },
            voucher: Boolean,
            contract: Boolean,
            archive: {
                figure: Boolean,
                cheque: Boolean,
                contract: Boolean,
                file: Boolean,
                digital: Boolean,
                original: Boolean
            },
            destroy: Boolean,
            approval: Boolean,
            lending: {
                voucher: Boolean,
                contract: Boolean,
                file: Boolean
            }
        }
    });

    var groupSchema = new mongoose.Schema({
        name: String,
        comment: String,
        accounts: [String],
        rights: {
            system: {
                log: Boolean,
                account: Boolean,
                group: Boolean
            },
            projects: Boolean,
            subjects: Boolean,
            date: {
                begin: Boolean,
                end: Boolean
            },
            figures: {
                readable: Boolean,
                removable: Boolean
            },
            voucher: Boolean,
            contract: Boolean,
            archive: {
                figure: Boolean,
                cheque: Boolean,
                contract: Boolean,
                file: Boolean,
                digital: Boolean,
                original: Boolean
            },
            destroy: Boolean,
            approval: Boolean,
            lending: {
                voucher: Boolean,
                contract: Boolean,
                file: Boolean
            }
        }
    });

    var lendingSchema = new mongoose.Schema({
        time: Date,
        borrower: String,
        target: String,
        reason: String,
        retrieve: Date,
        comment: String
    });

    return {
        archive:  mongoose.model('archive', archiveSchema),
        store:  mongoose.model('store', storeSchema),
        project: mongoose.model('project', projectSchema),
        figure: mongoose.model('figure', figureSchema),
        log: mongoose.model('log', logSchema),
        account: mongoose.model('account', accountSchema),
        group: mongoose.model('group', groupSchema),
        lending: mongoose.model('lending', lendingSchema)
    };
}

// connect to mongodb when system started
connectDb();
// create models being used
var models = createModels();

function save(model, condition, data, callback) {
    models[model]
        .update(condition, data, {upsert: true, multi: true}, callback);
}

function query(model, condition, callback) {
    models[model]
        .find(condition)
        .lean()                 // make return value changeable
        .limit(maxReturnedDoc)  // limit returned documents
        .exec(callback);
}

function remove(model, condition, callback) {
    models[model]
        .remove(condition, callback);
}

module.exports = {
    save: save,
    query: query,
    remove: remove
};