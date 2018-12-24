var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";

var db;

MongoClient.connect(mongouri, {poolSize:10}, function(err, mongodb) {
    assert.equal(null, err);
    db = mongodb.db(DBNAME);
    console.log("connected to db: "+ db.databaseName);
    }
);

