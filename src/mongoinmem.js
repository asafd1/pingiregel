var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const MongoInMemory = require('mongo-in-memory');
const DBNAME = "pingiregel";

var mongoServerInstance = new MongoInMemory(27017);

if (process.env.TELEGRAM_TOKEN == undefined || process.env.BASE_URL == undefined) {
    console.log("To set token and base url, use:");
    console.log("export TELEGRAM_TOKEN=<token>");
    console.log("export BASE_URL=<ngrok-url>");
  }
  
const token   = process.env.TELEGRAM_TOKEN;
const baseUrl = process.env.BASE_URL;

function addKey(collection, _key, _value) {
    console.log("add key " + _key);
    
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

function connect () {
    MongoClient.connect(mongoServerInstance.getMongouri(), {useNewUrlParser:true}, function(err, mongodb) {
        if (err != undefined && err != null) {
            console.log(err);
        }
        
        db = mongodb.db(DBNAME);
        console.log("connected to db: "+ db.databaseName);
        init(db);
        }
    );
}

mongoServerInstance.start((err, config) => {
    if (err) {
        console.log(err);
    }
    console.log("HOST " + config.host);
    console.log("PORT " + config.port);

    connect();
});

