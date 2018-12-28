var BOT = require("./bot");
var DB;
var Game = require("./game");
var _ = require("underscore");

exports.init = function (db) {
    DB = db;
    BOT.init(db);
    return this;
}

exports.getBot = function () {
    return BOT;
}

function createGameIfNeeded(games) {
    if (_.isEmpty(games)) {
        var game = new Game();
        DB.addGame(game);
        return game;
    }

    _.each(games, (game, index, games) => { 
        now = new Date();
        if (game.time < now) {
            game.status = "closed";
            DB.updateGame(game.id, game);
        }
    });
    games = _.filter(games, (game) => { return game.status == "open" });
    if (_.isEmpty(games)) {
        var game = new Game();
        DB.addGame(game);
        return game;
    } 
}

exports.getCurrentGame = function () {
    return DB.getGames({status:"open",}).then((games) => createGameIfNeeded(games));
}

exports.pollCurrentGame = function () {
    exports.getCurrentGame().then(sendPoll(game));
}

function sendPoll(game) {
    BOT.sendPoll(game.getDayOfWeek(), game.getHour(), game.venue.title);
}

function handleGame(game) {
    if (game.lastSent == null) {
        sendPoll(game);
    }
}

exports.check = function () {
    exports.getCurrentGame().then((game) => handleGame(game));
}

exports.handleCallback = function (requestBody) {
    BOT.callbackReply(requestBody.callback_query);
  }
  