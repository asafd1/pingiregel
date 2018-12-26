var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";

var db;

exports.connect = function () {
    return (MongoClient.connect(mongouri).then((mongodb) => {
        db = mongodb.db(DBNAME);
        console.log("connected to db: "+ db.databaseName);
        return this;
    }));
}

// SETTINGS
exports.getSetting = function (key) {
    console.log("getting setting: " + key);
    return db.collection("settings").findOne({key:key});
}

exports.deleteSetting = function (key) {
    console.log("delete setting: " + key);
    return db.collection("settings").deleteOne({key:key});
}

exports.insertSetting = function (setting) {
    console.log("insert setting: " + setting);
    return db.collection("settings").insertOne(setting);
}

exports.getSettings = function () {
    console.log("getting settgins");
    return db.collection("settings").find({}).toArray();
}

// MISC
exports.getMisc = function (key) {
    console.log("getting misc: " + key);
    return db.collection("misc").findOne({key:key});
}

exports.deleteMisc = function (key) {
    console.log("delete misc: " + key);
    return db.collection("misc").deleteOne({key:key});
}

exports.insertMisc = function (setting) {
    console.log("insert misc: " + setting);
    return db.collection("misc").insertOne(setting);
}

// PLAYERS
exports.getPlayer = function (id) {
    console.log("getting player by id: " + id);
    return db.collection("players").findOne({id:id});
}

exports.getPlayers = function () {
    console.log("getting all players");
    return db.collection("players").find({}).toArray();
}

exports.insertPlayer = function (player) {
    console.log("adding player: " + player);
    return db.collection("players").insertOne(player);
}

exports.updatePlayer = function (id, player) {
    console.log("updating player by id: " + id);
    return db.collection("players").updateOne({id:id}, { $set: player });
}
