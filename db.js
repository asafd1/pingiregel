var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");

const DBNAME = "pingiregel";
var mongouri = "mongodb://localhost:27017/";
var db;

exports.prepareForSend = function (response) {
    if (response.ops && response.result) {
        response.result.docs = response.ops; 
    }
    return response;
};

function toObjectId (id) {
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
    return db.collection("players").findOne({_id:parseInt(id)});
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
    return db.collection("players").updateOne({_id:parseInt(id)}, { $set: player });
}

exports.deletePlayer = function (id) {
    console.log("delete player by id: " + id);
    return db.collection("players").deleteOne({_id:parseInt(id)});
}

// GAMES
var Game = require("./game"); // this needs to be generalized (supply object mappers to the db module)

exports.getGames = function (_status, _after) {
    console.log(`getting games (by status=${_status} and after=${_after})`);
    var opts = {};
    if (_status) {
        opts.status = _status;
    }
    if (_after) {
        opts.time = { $gt : _after };
    }
    return db.collection("games").find(opts).toArray().then((docs) => _.map(docs,(doc)=>Game.createGameFromDb(doc)));
}

exports.getGame = function (id) {
    console.log("getting game by id: " + id);
    return db.collection("games").findOne({_id:toObjectId(id)}).then((doc)=>{
        return Game.createGameFromDb(doc)
    });
}

exports.addGame = function (game) {
    console.log("adding game: " + game);
    p = db.collection("games").insertOne(game);
    game.setId(game._id); // the _id is being set synchronously
    return p;
}

exports.updateGame = function (id, game) {
    console.log("updating game by id: " + id);
    return db.collection("games").updateOne({_id:toObjectId(id)}, { $set: game });
}

exports.deleteGame = function (id) {
    console.log("deleting game by id: " + id);
    return db.collection("games").deleteOne({_id:toObjectId(id)});
}
