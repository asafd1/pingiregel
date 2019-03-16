var assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");
var logger = require('./logger');
var Game = require("./game"); // this needs to be generalized (supply object mappers to the db module)
var Player = require("./player"); // this needs to be generalized (supply object mappers to the db module)

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
    return (MongoClient.connect(mongouri, { useNewUrlParser: true, autoIndex: false }).then((mongodb) => {
        db = mongodb.db(DBNAME);
        logger.log("connected to db: "+ db.databaseName);
        return this;
    }));
}

// SETTINGS
exports.makeSetting = function (_key, _value) {
    return { key : _key,
             value : _value };
}

exports.getSetting = function (_key) {
    logger.log("getting setting: " + _key);
    p = db.collection("settings").findOne({key:_key});
    p.then((row)=> {
        if (row) {
            logger.log(`got setting. key=${row.key}, value=${row.value}`);
        } else {
            logger.log(`setting not found. key=${_key}`);
        }
    });
    return p;
}

exports.deleteSetting = function (_key) {
    logger.log("delete setting: " + _key);
    return db.collection("settings").deleteOne({key:_key});
}

exports.addSetting = function (setting) {
    logger.log(`insert setting. key=${setting.key}, value=${setting.value}`);
    return db.collection("settings").insertOne(setting);
}

exports.getSettings = function () {
    logger.log("getting settgins");
    return db.collection("settings").find({}).toArray();
}

// MISC
exports.getMisc = function (_key) {
    logger.log("getting misc: " + _key);
    return db.collection("misc").findOne({key:_key});
}

exports.deleteMisc = function (_key) {
    logger.log("delete misc: " + _key);
    return db.collection("misc").deleteOne({key:_key});
}

exports.addMisc = function (setting) {
    logger.log("insert misc: " + setting);
    return db.collection("misc").insertOne(setting);
}

// PLAYERS
exports.getPlayer = function (id) {
    logger.log("getting player by id: " + id);
    return db.collection("players").findOne({_id:parseInt(id)}).then((doc) => {
        if (doc) {
            var player = Player.createPlayerFromDb(doc);
            logger.log("found player: " + JSON.stringify(player, null, 2));
            return player;
        }
    });
}

exports.getPlayers = function () {
    logger.log("getting all players");
    p = db.collection("players").find({}).toArray();
    return p.then((docs) => {
        logger.log(`found ${_.size(docs)} players`);
        return _.map(docs,(doc) => {
            return Player.createPlayerFromDb(doc)
        })
    });
}

exports.addPlayer = function (player) {
    logger.log("adding player: " + player);
    return db.collection("players").insertOne(player);
}

exports.updatePlayer = function (id, player) {
    logger.log("updating player: " + JSON.stringify(player, null, 2));
    return db.collection("players").updateOne({_id:id}, { $set: player });
}

exports.deletePlayer = function (id) {
    logger.log("delete player by id: " + id);
    return db.collection("players").deleteOne({_id:id});
}

// GAMES
exports.getGames = function (_status, _after) {
    logger.log(`getting games (by status=${_status} and after=${_after})`);
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
    logger.log("getting game by id: " + id);
    return db.collection("games").findOne({_id:toObjectId(id)}).then((doc)=>{
        if (doc) {
            var game = Game.createGameFromDb(doc);
            logger.log("found game: " + JSON.stringify(game, null, 2));
            return game;
        }
        return null;
    });
}

exports.addGame = function (game) {
    logger.log("adding game: " + JSON.stringify(game, null, 2));
    p = db.collection("games").insertOne(game);
    game.setId(game._id); // the _id is being set synchronously
    return p;
}

exports.updateGame = function (id, game) {
    logger.log("updating game by id: " + id);
    logger.log("game updated to: " + JSON.stringify(game));
    return db.collection("games").updateOne({_id:toObjectId(id)}, { $set: game });
}

exports.deleteGame = function (id) {
    logger.log("deleting game by id: " + id);
    return db.collection("games").deleteOne({_id:toObjectId(id)});
}
