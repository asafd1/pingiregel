var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";
var db;

exports.prepareForSend = function (response) {
    if (response.ops && response.result) {
        response.result.docs = response.ops; 
    }
    return response;
};

function getObjectID (id) {
    if (typeof id === ObjectID) {
        return id;
    }
    return new ObjectID(id);
}

exports.connect = function () {
    return (MongoClient.connect(mongouri, { useNewUrlParser: true }).then((mongodb) => {
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

exports.addSetting = function (setting) {
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

exports.addMisc = function (setting) {
    console.log("insert misc: " + setting);
    return db.collection("misc").insertOne(setting);
}

// PLAYERS
exports.getPlayer = function (id) {
    console.log("getting player by id: " + id);
    return db.collection("players").findOne({_id:getObjectID(id)});
}

exports.getPlayers = function () {
    console.log("getting all players");
    return db.collection("players").find({}).toArray();
}

exports.addPlayer = function (player) {
    console.log("adding player: " + player);
    return db.collection("players").insertOne(player);
}

exports.updatePlayer = function (id, player) {
    console.log("updating player by id: " + id);
    return db.collection("players").updateOne({_id:getObjectID(id)}, { $set: player });
}

// GAMES
exports.getGames = function (_status, _after) {
    console.log(`getting games (by status=${_status} and after=${_after})`);
    var opts = {};
    if (_status) {
        opts.status = _status;
    }
    if (_after) {
        opts.time = { $gt : _after };
    }
    return db.collection("games").find(opts).toArray();
}

exports.getGame = function (id) {
    console.log("getting game by id: " + id);
    return db.collection("games").findOne({_id:getObjectID(id)});
}

exports.addGame = function (game) {
    console.log("adding game: " + game);
    return db.collection("games").insertOne(game);
}

exports.updateGame = function (id, game) {
    console.log("updating game by id: " + id);
    return db.collection("games").updateOne({_id:getObjectID(id)}, { $set: game });
}

exports.deleteGame = function (id) {
    console.log("deleting game by id: " + id);
    return db.collection("games").deleteOne({_id:getObjectID(id)});
}
