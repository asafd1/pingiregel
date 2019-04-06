const MongoClient = require('mongodb').MongoClient;
var _ = require("underscore");
var logger = require('./logger');
var Game = require("./game"); // this needs to be generalized (supply object mappers to the db module)
var Player = require("./player"); // this needs to be generalized (supply object mappers to the db module)
var httpContext = require('express-http-context');

const DBNAME = "pingiregel";
const CHAT_ID_COL = "chatId";
const CHAT_TITLE_COL = "chatTitle";

var mongouri = "mongodb://localhost:27017/";
var db;

exports.prepareForSend = function (response) {
    if (response.ops && response.result) {
        response.result.docs = response.ops; 
    }
    return response;
};

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
function getCurrentMessage() {
    var message = httpContext.get('message');
    if (!message) {
        throw "could not find current message on httpContext";
    }
    return message;
}

// function getChatId() {
//     var message = httpContext.get('message');
//     if (message) {
//         return httpContext.get('message').chat.id;
//     }
// }

function getCompositeIdWithChatIdJson(id) {
    return JSON.stringify(getCompositeIdWithChatId(id));
}

function getCompositeIdWithChatId(id) {
    var _id = {};
    _id['_id'] = id;
    _id[CHAT_ID_COL] = getCurrentMessage().chat.id;
    return _id;
}

function cloneObjectwithCompositeIdWithChatId(obj) {
    var newObj = Object.assign({}, obj);
    newObj._id = getCompositeIdWithChatId(obj._id);
    newObj[CHAT_TITLE_COL] = httpContext.get('message').chat.title; // nice to have not mandatory
    return newObj;
}

function getFilterByChatId() {
    chatId = getCurrentMessage().chat.id;
    filter = {};
    filter[`_id.${CHAT_ID_COL}`] = chatId;
    return filter;
}

exports.getPlayers = function () {
    logger.log("getting all players for this chat");
    var opts = getFilterByChatId();
    p = db.collection("players").find(opts).toArray();
    return p.then((docs) => {
        logger.log(`found ${_.size(docs)} players`);
        return _.map(docs,(doc) => {
            return Player.createPlayerFromDb(doc)
        })
    });
}

exports.addPlayer = function (player) {
    logger.log("adding player: " + player);
    return db.collection("players").insertOne(cloneObjectwithCompositeIdWithChatId(player));
}

exports.updatePlayer = function (id, player) {
    logger.log("updating player: " + JSON.stringify(player, null, 2));
    return db.collection("players").updateOne({_id:getCompositeIdWithChatId(id)}, { $set: cloneObjectwithCompositeIdWithChatId(player) });
}

exports.deletePlayer = function (id) {
    logger.log("delete player by id: " + id);
    return db.collection("players").deleteOne({_id:getCompositeIdWithChatId(id)});
}

// GAMES
exports.getGames = function (_status) {
    logger.log(`getting games (by status=${_status})`);
    var opts = getFilterByChatId();
    if (_status) {
        opts.status = _status;
    }
    return db.collection("games").find(opts).toArray().then((docs) => _.map(docs,(doc)=>Game.createGameFromDb(doc)));
}

exports.getGame = function (id) {
    logger.log("getting game by id: " + id);
    return db.collection("games").findOne({_id:getCompositeIdWithChatIdJson(id)}).then((doc)=>{
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
    p = db.collection("games").insertOne(cloneObjectwithCompositeIdWithChatId(game));
    return p;
}

exports.updateGame = function (id, game) {
    logger.log("updating game by id: " + id);
    logger.log("game updated to: " + JSON.stringify(game));
    return db.collection("games").updateOne({_id:getCompositeIdWithChatId(id)}, { $set: cloneObjectwithCompositeIdWithChatId(game) });
}

exports.deleteGame = function (id) {
    logger.log("deleting game by id: " + id);
    return db.collection("games").deleteOne({_id:getCompositeIdWithChatId(id)});
}

// CHATS
exports.setChat = function (chat) {
    //var chatDb = Object.assign({}, chat); // clone chat before chaning it
    // chat._id = chat.id;
    // delete chat.id;
    logger.log("setting chat: " + JSON.stringify(chat, null, 2));
    return db.collection("chats").updateOne({_id:chat.id}, {$set:chat}, {upsert:true}).catch((e) => logger.log(e));
}
