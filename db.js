var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";

var db;

MongoClient.connect(mongouri, function(err, mongodb) {
    assert.equal(null, err);
    db = mongodb.db(DBNAME);
    console.log("connected to db: "+ db.databaseName);
    }
);

exports.getSetting = function (_key) {
    console.log("getting " + _key);
    return db.collection("settings").findOne({key:_key});
}