var BOT = require("./bot");
var DB;
var Game = require("./game");
var Player = require("./player");
var _ = require("underscore");
var logger = require('./logger');
var cron = require('node-cron');
var TARGET_NUMBER_OF_PLAYERS = 9;

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

function getNow() {
//    return new Date("2019-03-21 21:00:00");
    return new Date();
}

function isMorning(now) {
    return now.getHours() == 9;
}

function isEvening(now) {
    return now.getHours() == 21;
}

function schedule() {
    // checkGame();
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

function resetPlayer(player) {
    if (player.isFriend()) {
        DB.deletePlayer(player.getId());
        return;
    }

    player.resetVote();
    DB.updatePlayer(player.getId(), player);
}

function resetPlayers() {
    DB.getPlayers().then((players) => {
        _.forEach(players, (player) => {
            resetPlayer(player);
        })
    });
}

function createGameIfNeeded(games) {
    if (_.isEmpty(games)) {
        var game = new Game();
        resetPlayers();
        DB.addGame(game);
        return game;
    }

    var currentGame = _.max(games, (game) => {return parseInt(game.getId(), 16)});
    
    _.each(games, (game, index, games) => { 
        now = getNow();
        if (game.time < now || game.getId() != currentGame.getId()) {
            game.status = "closed";
            logger.log("closing old game: " + game.getId());
            
            DB.updateGame(game.getId(), game);
        }
    });

    games = _.filter(games, (game) => { return game.status == "open" });
    if (_.isEmpty(games)) {
        var game = new Game();
        resetPlayers();
        DB.addGame(game);
        return game;
    }

    return currentGame;
}

exports.getCurrentGame = getCurrentGame;

function getCurrentGame() {
    return DB.getGames("open").then((games) => {
        return createGameIfNeeded(games);
    });
}

// exports.pollCurrentGame = function () {
//     exports.getCurrentGame().then((game) => sendPoll(game));
// }

function updatePoll(game, results, expand) {
    BOT.sendPoll(game, results, expand);
}

function updateGame(game, messageId, now) {
    game.setMessageId(messageId);
    if (now && now > 0) {
        game.setLastSent(now);
    }
    DB.updateGame(game.getId(), game);
    return game;
}

function sendPoll(game, now) {
    p = BOT.sendPoll(game).then();
    return p.then((messageId) => {
        return updateGame(game, messageId, now);
    });
}

function sendGame(game, now) {
    logger.log(`sendGame. gameId = ${game.getId()}`);
    var p;

    if (!game.getLastSent()) {
        game.setMessageId(null);
        p = sendPoll(game, now);
    }

    // sendPoll may update game (lastSend and messageId)
    if (p == null) {
        p = getCurrentGame();
    }
    p.then((game) => {
        if (now.getDay() >= daysOfWeek.indexOf("רביעי") && 
            now.getDay() <= daysOfWeek.indexOf("חמישי")) {
            var p = getResults();
            p.then((results) => {
                if ((!hasTargetPlayers(results) && !game.getAllowFriends()) || 
                    (hasTargetPlayers(results) && game.getAllowFriends())) {
                        game.setAllowFriends(!game.getAllowFriends());
                        DB.updateGame(game.getId(), game);
                        updatePoll(game, results);
                }
            })
        }
    });
}
  
function hasTargetPlayers(results) {
    return results && results.yes && results.yes >= TARGET_NUMBER_OF_PLAYERS;
}

function getNotVoted(results) {
    if (results && results.nill && results.nill.length > 0) {
        return results.nill;
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

function remindGame(game, now) {
    logger.log(`remindGame. gameId = ${game.getId()}`);

    var p = getResults();
    p.then((results) => {
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
    });
}

function handleGame(game) {
    logger.log(`handleGame. gameId = ${game.getId()}`);
    now = getNow();

    sendGame(game, now);
    remindGame(game, now);
    return game;
}

function checkGame() {
    logger.log("checking game status");
    return getCurrentGame().then((game) => handleGame(game));
}

exports.checkGame = function () {
    return checkGame();
}

function isFriendVote(vote) {
    return (vote == "plus1" || vote == "minus1");
}

function handleFriendVote(gameId, voterPlayer, vote, players, results) {
    voterPlayer.setFriends(players);

    if (vote == "plus1") {
        var id = voterPlayer.getNextFriendId();
        var firstname = voterPlayer.getFirstName() + "'s friend";
        player = new Player (id, id, firstname, null);
        player.setVote(gameId, "yes");
        player.setJoinedAt(getNow());
        DB.addPlayer(player);
        return player;
    } else {
        var id = voterPlayer.getLastFriendId();
        if (id) {
            DB.deletePlayer(id);
        }
        results["yes"] = _.reject(results["yes"], (p) => {return p.getId() == id});
        return null;
    }
}

function handlePlayerVote(gameId, player, vote, results) {
    // player = Player.createPlayerFromDb(player);
    oldVote = player.getVote();
    if (oldVote) {
        results[oldVote] = _.reject(results[oldVote], (p) => {return p.getId() == player.getId()});
    }

    if (oldVote != vote) {
        player.setVote(gameId, vote);
        DB.updatePlayer(player.getId(), player);
    }

    return player;
}

function getNewResults(gameId, players, from, vote) {
    var results = _.groupBy(players, "vote");
    var player = _.find(players, (player) => {return player._id == from.id});
    if (!player) {
        player = new Player (from.id, from.username, from.first_name, from.last_name);
        player.setJoinedAt(getNow());
        DB.addPlayer(player);
    }

    if (isFriendVote(vote)) {
        player = handleFriendVote(gameId, player, vote, players, results);
    } else {
        player = handlePlayerVote(gameId, player, vote, results);
    }

    if (player) {
        if (!results[player.getVote()]) {
            results[player.getVote()] = [];
        }

        results[player.getVote()].push(player);
    }

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

        p.then((results) => DB.getGame(gameId).then((game) => {
            if (game) {
                updatePoll(game, results);
            }
        }));
    }
    if (callbackQuery.data.startsWith("expand") || callbackQuery.data.startsWith("collapse")) {
        var parts = callbackQuery.data.split(".");
        var gameId = parts[1];
        p = getResults();
        p.then((results) => DB.getGame(gameId).then((game) => {
            updatePoll(game, results, expand = (parts[0]=="expand"))
        }));
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

exports.handleWebhook = function (requestBody) {
    updateAlreadySeen(requestBody.update_id).then((seen) => {
        if (seen) {
            return;
        }
        if (requestBody.callback_query) {
            logger.log(`got callback. chat_instance=${requestBody.callback_query.chat_instance}, update_id=${requestBody.update_id}`);
            handleCallbackQuery(requestBody.callback_query);
        }
        if (requestBody.message) {
            logger.log(`got message. chat_id=${requestBody.message.chat.id}, update_id=${requestBody.update_id}`);
            BOT.handleMessage(requestBody);
        }
    })
}
  