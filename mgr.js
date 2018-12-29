var BOT = require("./bot");
var DB;
var Game = require("./game");
var Player = require("./player");
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

    return Game.createGameFromDb(currentGame);
}

exports.getCurrentGame = function () {
    return DB.getGames("open").then((games) => createGameIfNeeded(games));
}

exports.pollCurrentGame = function () {
    exports.getCurrentGame().then((game) => sendPoll(game));
}

function updatePoll(gameId, results, messageId) {
    DB.getGame(gameId).then((g) => {
        game = Game.createGameFromDb(g);
        BOT.sendPoll(game.getId(), game.getDayOfWeek(), game.getHour(), game.venue.title, results, messageId);
    });
}

function sendPoll(game) {
    BOT.sendPoll(game.getId(), game.getDayOfWeek(), game.getHour(), game.venue.title);
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

function getNewResults(gameId, players, from, vote) {
    var results = _.groupBy(players, "vote");
    var p = _.find(players, (player) => {return player._id == from.id});
    var player;
    if (!p) {
        player = new Player (from.id, from.first_name, from.last_name);
        player.setVote(gameId, vote);
        player.setJoinedAt(new Date());
        DB.addPlayer(player);
    } else {
        player = Player.createPlayerFromDb(p);
        oldVote = player.getVote();
        results[oldVote] = _.reject(results[oldVote], (p) => {return p._id == player.getId()});
        if (oldVote != vote) {
            player.setVote(gameId, vote);
            DB.updatePlayer(player.getId(), player);
        }
    }
    if (!results[vote]) {
        results[vote] = [];
    }
    results[vote].push(player);

    return results;
}

function handleVote (gameId, from, vote) {
    return DB.getPlayers().then((players) => {
        return getNewResults(gameId, players, from, vote);
    });
}

exports.handleCallback = function (requestBody) {
    callbackQuery = requestBody.callback_query;
    if (callbackQuery.data.startsWith("poll")) {
        var parts = callbackQuery.data.split(".");
        var gameId = parts[1];
        var vote = parts[2];
        BOT.callbackReply(callbackQuery, vote);
        p = handleVote(gameId, callbackQuery.from, vote);
        p.then((results) => {updatePoll(gameId, results, callbackQuery.message.message_id)});;
    }
  }
  