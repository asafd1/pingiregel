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
exports.getSetting = function (_key) {
    console.log("getting setting: " + _key);
    return db.collection("settings").findOne({key:_key});
}

exports.deleteSetting = function (_key) {
    console.log("delete setting: " + _key);
    return db.collection("settings").deleteOne({key:_key});
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
exports.getMisc = function (_key) {
    console.log("getting misc: " + _key);
    return db.collection("misc").findOne({key:_key});
}

exports.deleteMisc = function (_key) {
    console.log("delete misc: " + _key);
    return db.collection("misc").deleteOne({key:_key});
}

exports.insertMisc = function (setting) {
    console.log("insert misc: " + setting);
    return db.collection("misc").insertOne(setting);
}

// PLAYERS
exports.getPlayer = function (_id) {
    console.log("getting player by id: " + _id);
    return db.collection("players").findOne({id:_id});
}

exports.getPlayers = function () {
    console.log("getting all players");
    return db.collection("players").find({}).toArray();
}

exports.insertPlayer = function (player) {
    console.log("adding player: " + player);
    return db.collection("players").insertOne(player);
}

exports.updatePlayer = function (_id, player) {
    console.log("updating player by id: " + _id);
    return db.collection("players").updateOne({id:_id}, { $set: player });
}
