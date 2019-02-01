var BOT = require("./bot");
var DB;
var Game = require("./game");
var Player = require("./player");
var _ = require("underscore");
var logger = require('./logger');
var cron = require('node-cron');
var TARGET_NUMBER_OF_PLAYERS = 9;

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

function isMorning(now) {
    return now.getHours() == 9;
}

function isEvening(now) {
    return now.getHours() == 21;
}

function schedule() {
    cron.schedule('0 * * * *', () => {
        checkGame();
    });  
}
  
exports.init = function (db) {
    DB = db;
    BOT.init(db, {targetNumberOfPlayers:TARGET_NUMBER_OF_PLAYERS});
    schedule();
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

    var currentGame = _.max(games, (game) => {return parseInt(game.getId(), 16)});
    
    _.each(games, (game, index, games) => { 
        now = new Date();
        if (game.time < now || game.getId() != currentGame.getId()) {
            game.status = "closed";
            logger.log("closing old game: " + game.getId());
            
            DB.updateGame(game.getId(), game);
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
    return DB.getGames("open").then((games) => {
        return createGameIfNeeded(games);
    });
}

exports.pollCurrentGame = function () {
    exports.getCurrentGame().then((game) => sendPoll(game));
}

function updatePoll(gameId, results, messageId, expand) {
    DB.getGame(gameId).then((game) => {
        BOT.sendPoll(game, results, messageId, expand);
    });
}

function sendPoll(game) {
    BOT.sendPoll(game);
}

function needResend(game) {
    return false;
}


function sendGameFirstTime(game) {
    if (now.getDay() == daysOfWeek.indexOf("ראשון") && isMorning(now)) {
        if (!game.lastSent) {
            sendPoll(game);
            game.lastSent = now;
            DB.updateGame(game.getId(), game);
        }
    }
}

function getUsernames(players) {
    usernames = _.map(players, (player) => {
      username = player.username;
      if (player.lastname) {
      return username;
    });
  
    return usernames;
  }
  
function hasTargetPlayers(results) {
    return results && results.yes && results.yes >= TARGET_NUMBER_OF_PLAYERS;
}

function getNotVoted(results) {
    if (results && results.nill && results.nill > 0) {
        return getUsernames(results.nill);
    }
    return null;
}

function checkAndRemind(game, results) {
    if (!hasTargetPlayers(results)) {
        if (getNotVoted(results) != null) {
            BOT.sendReminder(game, getNotVoted(results));
        }
    }
}

function remindGame(game) {
    var results = getResults();
    var now = new Date();
    switch(now.getDay()) {
        case daysOfWeek.indexOf("ראשון"):
            if (isEvening(now)) {
                checkAndRemind(game, results);        
            }
            break;
        case daysOfWeek.indexOf("שני"):
        case daysOfWeek.indexOf("שלישי"):
            if (isMorning(now) || isEvening(now)) {
                checkAndRemind(game, results);        
            }
            break;
    }

    if (now.getDay() == daysOfWeek.indexOf("ראשון") && isEvening(now)) {
        checkAndRemind(results);
    }
}

function resetGame(game) {
    
}

function handleGame(game) {
    now = new Date();

    sendGameFirstTime(game);
    remindGame(game);
    resetGame(game);
    return game;
}

function checkGame() {
    logger.log("checking game status");
    return exports.getCurrentGame().then((game) => handleGame(game));
}

exports.checkGame = function () {
    return checkGame();
}

function getNewResults(gameId, players, from, vote) {
    var results = _.groupBy(players, "vote");
    var p = _.find(players, (player) => {return player._id == from.id});
    var player;
    if (!p) {
        player = new Player (from.id, from.username, from.first_name, from.last_name);
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

function getResults () {
    return DB.getPlayers().then((players) => {
      var results = _.groupBy(players, "vote");
      return results;
    });
}

function handleCallbackQuery(callbackQuery) {
    if (callbackQuery.data.startsWith("poll")) {
        logger.log(`chat.id=${callbackQuery.message.chat.id} msg.id=${callbackQuery.message.message_id}`);
        
        var parts = callbackQuery.data.split(".");
        var gameId = parts[1];
        var vote = parts.length == 3 ? parts[2] : null;
        var p;
        if (vote) {
            BOT.callbackReply(callbackQuery, vote);
            p = handleVote(gameId, callbackQuery.from, vote);
        } else {
            p = getResults();
        }
        p.then((results) => {updatePoll(gameId, results, callbackQuery.message.message_id)});;
    }
    if (callbackQuery.data.startsWith("expand") || callbackQuery.data.startsWith("collapse")) {
        var parts = callbackQuery.data.split(".");
        var gameId = parts[1];
        p = getResults();
        p.then((results) => {updatePoll(gameId, results, callbackQuery.message.message_id, parts[0]=="expand")});;
    }
}

function updateAlreadySeen(updateId) {
    while (!DB) {}
    return DB.getMisc("updateId").then((value) => {
        if (value && value >= updateId) {
            return true;
        }
        DB.addMisc(DB.makeSetting("updateId", updateId));
        return false;
    })
}

exports.handleCallback = function (requestBody) {
    updateAlreadySeen(requestBody.update_id).then((seen) => {
        if (seen) {
            return;
        }
        if (requestBody.callback_query) {
            handleCallbackQuery(requestBody.callback_query);
        }
        if (requestBody.message) {
            BOT.handleMessage(requestBody);
        }
    })
}
  