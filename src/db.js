const MongoClient = require('mongodb').MongoClient;
var _ = require("underscore");
var logger = require('./logger');
var httpContext = require('express-http-context');
var Game = require("./game"); // this needs to be generalized (supply object mappers to the db module)
var Player = require("./player"); // this needs to be generalized (supply object mappers to the db module)
let Chat = require('./chat.js');

const DBNAME = "pingiregel";
const CHAT_ID_COL = "chatId";
const CHAT_TITLE_COL = "chatTitle";

var mongouri = "mongodb://localhost:27017/";
var db;
var mongodbConnection;

exports.prepareForSend = function (response) {
    if (response.ops && response.result) {
        response.result.docs = response.ops; 
    }
    return response;
};

exports.connect = function () {
    return (MongoClient.connect(mongouri, { useNewUrlParser: true }).then((mongodb) => {
        mongodbConnection = mongodb;
        db = mongodb.db(DBNAME);
        logger.log("connected to db: "+ db.databaseName);
        return this;
    }));
}

exports.close = function () {
    mongodbConnection.close();
}

// SETTINGS
exports.makeSetting = function (_key, _value) {
    return { _id : _key,
             key : _key,
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

exports.setMisc = function (setting) {
    logger.log("set misc: " + setting.key);
    return db.collection("misc").updateOne({_id:setting.key}, {$set: setting}, {upsert:true});
}

// PLAYERS
function getCompositeIdWithChatId(chatId, id) {
    var _id = {};
    _id['_id'] = id;
    _id[CHAT_ID_COL] = chatId;
    return _id;
}

function cloneObjectwithCompositeIdWithChatId(chatId, obj) {
    var newObj = Object.assign({}, obj);
    newObj._id = getCompositeIdWithChatId(chatId, obj._id);
    return newObj;
}

function getFilterByChatId(chatId) {
    filter = {};
    filter[`_id.${CHAT_ID_COL}`] = chatId;
    return filter;
}

exports.getPlayers = function (chatId) {
    logger.log("getting all players for this chat: " + chatId);
    var opts = getFilterByChatId(chatId);
    p = db.collection("players").find(opts).toArray();
    return p.then((docs) => {
        logger.log(`found ${_.size(docs)} players`);
        return _.map(docs,(doc) => {
            return Player.createPlayerFromDb(doc)
        })
    });
}

exports.getPlayer = function (chatId, id) {
    logger.log(`chat_id=${chatId} gettinf player by id: ` + id);
    return db.collection("players").findOne({_id:getCompositeIdWithChatId(chatId, id)});
}

exports.addPlayer = function (chatId, player) {
    logger.log(`chat_id=${chatId} adding player: ` + JSON.stringify(player));
    return db.collection("players").insertOne(cloneObjectwithCompositeIdWithChatId(chatId, player));
}

exports.updatePlayer = function (chatId, id, player) {
    logger.log(`chat_id=${chatId} updating player: ` + JSON.stringify(player, null, 2));
    return db.collection("players").updateOne({_id:getCompositeIdWithChatId(chatId, id)}, { $set: cloneObjectwithCompositeIdWithChatId(chatId, player) });
}

exports.deletePlayer = function (chatId, id) {
    logger.log(`chat_id=${chatId} delete player by id: ` + id);
    return db.collection("players").deleteOne({_id:getCompositeIdWithChatId(chatId, id)});
}

// GAMES
exports.getGames = function (chatId, _status) {
    logger.log(`getting games (by status=${_status})`);
    var opts = getFilterByChatId(chatId);
    if (_status) {
        opts.status = _status;
    }
    return db.collection("games").find(opts).toArray().then((docs) => _.map(docs,(doc)=>Game.createGameFromDb(doc)));
}

exports.getGame = function (chatId, id) {
    id = parseInt(id);
    logger.log("getting game by id: " + id);
    return db.collection("games").findOne({_id:getCompositeIdWithChatId(chatId, id)}).then((doc)=>{
        if (doc) {
            var game = Game.createGameFromDb(doc);
            logger.log("found game: " + JSON.stringify(game, null, 2));
            return game;
        }
        return null;
    });
}

exports.addGame = function (chatId, game) {
    logger.log("adding game: " + JSON.stringify(game, null, 2));
    p = db.collection("games").insertOne(cloneObjectwithCompositeIdWithChatId(chatId, game));
    return p;
}

exports.updateGame = function (chatId, id, game) {
    logger.log("updating game by id: " + id);
    logger.log("game updated to: " + JSON.stringify(game));
    return db.collection("games").updateOne({_id:getCompositeIdWithChatId(chatId, id)}, { $set: cloneObjectwithCompositeIdWithChatId(chatId, game) });
}

exports.deleteGame = function (chatId, id) {
    logger.log("deleting game by id: " + id);
    return db.collection("games").deleteOne({_id:getCompositeIdWithChatId(id)});
}

// CHATS
exports.setChat = function (chat) {
    db.collection("chats").findOne({_id:chat.id}).then((doc) => {
        if (!doc) {
            logger.log("setting chat: " + JSON.stringify(chat, null, 2));
            return db.collection("chats").updateOne({_id:chat.id}, {$set:chat}, {upsert:true}).catch((e) => logger.log(e));
        } else {
            logger.log(`aleady exists. chatId=${chat.id}`);
        }
    })
}

exports.getChat = function (id) {
    logger.log("getting chat by id: " + id);
    return db.collection("chats").findOne({_id:id}).then((chat) => {
        if (chat) {
            return new Chat(chat);
        }
    })
}

exports.getChats = function () {
    logger.log("getting all chats");
    return db.collection("chats").find({}).toArray().then((docs) => _.map(docs,(doc)=>new Chat(doc)));
}
