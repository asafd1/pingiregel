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

    var currentGame = _.max(games, (game) => {return game._id.generationTime});
    
    _.each(games, (game, index, games) => { 
        now = new Date();
        if (game.time < now || game._id.generationTime != currentGame._id.generationTime) {
            game.status = "closed";
            console.log("closing old game: " + game._id);
            
            DB.updateGame(game._id, game);
        }
    });
    games = _.filter(games, (game) => { return game.status == "open" });
    if (_.isEmpty(games)) {
        var game = new Game();
        DB.addGame(game);
        return game;
    }

    return currentGame;
}

exports.getCurrentGame = function () {
    return DB.getGames("open").then((games) => createGameIfNeeded(games));
}

exports.pollCurrentGame = function () {
    exports.getCurrentGame().then(sendPoll(game));
}

function sendPoll(game) {
    BOT.sendPoll(game.getDayOfWeek(), game.getHour(), game.venue.title);
}

function needResend(game) {
    return false;
}

function handleGame(game) {
    now = new Date();

    if (!game.lastSent || needResend(game)) {
        sendPoll(game);
        game.lastSent = now;
        DB.updateGame(game._id, game);
    }
    return game;
}

exports.check = function () {
    return exports.getCurrentGame().then((game) => handleGame(game));
}

exports.handleCallback = function (requestBody) {
    BOT.callbackReply(requestBody.callback_query);
  }
  