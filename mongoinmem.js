var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const MongoInMemory = require('mongo-in-memory');
const DBNAME = "pingiregel";

var mongoServerInstance = new MongoInMemory(27017);

const token = process.argv[2];
const baseUrl = process.argv[3];

function addKey(collection, _key, _value) {
    collection.insertOne({key:_key, value:_value}).then(console.log(_key + " = " + _value));
}

function init(db) {
    db.createCollection("misc")
    .then((collection) => {
        addKey(collection, "token", token);
    });
    db.createCollection("settings")
    .then((collection) => {
        addKey(collection, "baseUrl", baseUrl);
    });
}

mongoServerInstance.start((err, config) => {
    assert.equal(null, err);
    console.log("HOST " + config.host);
    console.log("PORT " + config.port);
});

MongoClient.connect(mongoServerInstance.getMongouri(), function(err, mongodb) {
    db = mongodb.db(DBNAME);
    console.log("connected to db: "+ db.databaseName);
    init(db);
    }
);