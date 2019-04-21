var BOT = require("./bot");
var DB;
var Game = require("./game");
var Player = require("./player");
var Chat = require('./chat.js');
var _ = require("underscore");
var logger = require('./logger');
var httpContext = require('express-http-context');
var cron = require('node-cron');
var TARGET_NUMBER_OF_PLAYERS = 9;
var VERSION = "3.0";

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
    // handleGame();
    cron.schedule('0 * * * *', () => {
        handleGame();
    });  
}
  
exports.init = function (db) {
    DB = db;
    BOT.init(db, {targetNumberOfPlayers:TARGET_NUMBER_OF_PLAYERS});
    //schedule();
    return this;
}

exports.getBot = function () {
    return BOT;
}

function resetPlayer(player) {
    if (Player.isAnyFriend(player)) {
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

function getCurrentMessage() {
    return httpContext.get('message');
}

function getGameOptions() {
    let opts = [];
    currentMessage = getCurrentMessage();
    if (!currentMessage) {
        return Promise.resolve(opts);
    }

    return DB.getChat(currentMessage.chat.id).then((chat) => {
        if (chat) {
            opts.push(chat.hour);
            opts.push(chat.dayOfWeek);
            opts.push(chat.venue);
        }
        return opts;
    });
}

async function createNewGame() {
    resetPlayers();

    p = DB.getGames("open");
    return p.then(async (games) => {
        logger.log("closing old game(s)");
        _.each(games, (game) => { 
            game.status = "closed";
            logger.log("closing old game: " + game.getId());
            
            DB.updateGame(game.getId(), game);
            BOT.closePoll(game.getMessageId());
        });

        return getGameOptions().then(async (opts) => {
            var game = new Game(...opts);
            await DB.getGame(game.getId()).then(async (g) => {
                if (g) {
                    await DB.deleteGame(g.getId());
                } 
            });
            DB.addGame(game);
            return game;
        });
    });
}

function createGameIfNeeded(games) {
    if (_.isEmpty(games)) {
        var game = new Game();
        resetPlayers();
        DB.addGame(game);
        return game;
    }

    var currentGame = _.max(games, (game) => {return game.getId()});
    
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
        var currentGame = _.max(games, (game) => {return game.getId()});
        return currentGame;
    });
}

function updateGame(game, messageId, now) {
    game.setMessageId(messageId);
    if (now && now > 0) {
        game.setLastSent(now);
    }
    DB.updateGame(game.getId(), game);
    return game;
}

function updatePoll(game, results, resend) {
    p = BOT.sendPoll(game, results, resend);
    return p.then((messageId) => {
        return updateGame(game, messageId, getNow());
    });
}

function resendPoll(game, results, expand) {
    return updatePoll(game, results, true);
}

function sendPoll(game, now) {
    p = BOT.sendPoll(game).then();
    return p.then((messageId) => {
        return updateGame(game, messageId, now);
    });
}

// function sendGame(game, now) {
//     logger.log(`sendGame. gameId = ${game.getId()}`);
//     var p;

//     if (!game.getLastSent()) {
//         game.setMessageId(null);
//         p = sendPoll(game, now);
//     }

//     // sendPoll may update game (lastSent and messageId)
//     if (p == null) {
//         p = getCurrentGame();
//     }
//     p.then((game) => {
//         if (now.getDay() >= daysOfWeek.indexOf("רביעי") && 
//             now.getDay() <= daysOfWeek.indexOf("חמישי")) {
//             var p = getResults();
//             p.then((results) => {
//                 htp = hasTargetPlayers(results);
//                 if ((!htp && !game.getAllowFriends()) || 
//                     (htp && game.getAllowFriends())) {
//                         logger.log(`hasTargetPlayers = ${htp}. reverting allowFriends to '${!game.getAllowFriends()}'`);
//                         game.setAllowFriends(!game.getAllowFriends());
//                         DB.updateGame(game.getId(), game);
//                         updatePoll(game, results);
//                 }
//             })
//         }
//     });
// }
  
function hasTargetPlayers(results) {
    return results && results.yes && results.yes >= TARGET_NUMBER_OF_PLAYERS;
}

function getNotVoted(results) {
    if (results && results.nill && results.nill.length > 0) {
        return results.nill;
    }
    return null;
}

function remindCurrentGame(game) {
    getResults().then((results) => {
        if (getNotVoted(results) != null) {
            BOT.sendReminder(game, getNotVoted(results));
        }
    });
}

function getOrCreateGame(now) {
    if (now.getDay() == daysOfWeek.indexOf("ראשון") && isMorning(now)) {
        logger.log(`Sunday morning. creating game`);
        return createNewGame();
    } else {
        return getCurrentGame();
    }
}

function handleGame() {
    now = getNow();

    p = getOrCreateGame(now);
    p.then((game) => {
        sendGame(game, now);
        remindGame(game, now);
    });
}

function isFriendVote(vote) {
    return (vote == "plus1" || vote == "minus1");
}

function handleFriendVote(gameId, voterPlayer, vote, players, results) {
    voterPlayer.setFriends(players);

    if (vote == "plus1") {
        var id = voterPlayer.getNextFriendId();
        var firstname = voterPlayer.getNextFriendUsername();
        player = new Player (id, id, firstname);
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
        DB.setMisc(DB.makeSetting("updateId", updateId));
        return false;
    })
}

function newGameCommand(msg) {
    if (BOT.isAdmin(msg.from)) {
        p = createNewGame();
        p.then((game) => sendPoll(game, getNow()));
    }
}

function setAllowedFriends(game, toggle) {
    if (game.getAllowFriends() != toggle) {
        game.setAllowFriends(toggle);
        getResults().then((results) => {
            resendPoll(game, results)
        });
    }
}

function allowFriendsCommand(msg) {
    if (BOT.isAdmin(msg.from)) {
        p = getCurrentGame();
        p.then((game) => {
            setAllowedFriends(game, true);
        });
    }
}

function forbidFriendsCommand(msg) {
    if (BOT.isAdmin(msg.from)) {
        p = getCurrentGame();
        p.then((game) => {
            setAllowedFriends(game, false);
        });
    }
}

function popCommand() {
    p = getCurrentGame();
    p.then((game) => {
        getResults().then((results) => {
            resendPoll(game, results);
        });
    });
}

function remindCommand() {
    getCurrentGame().then((game) => {
        getResults().then((results) => {
            resendPoll(game, results).then( () => remindCurrentGame(game));
        });
    });
}

function helpCommand() {
    BOT.sendMessage(`${BOT.name()} ver ${VERSION}`);
}

// commands:
// newgame - start new game (admin only)
// allowfriends - enable friends buttons (admin only)
// forbidfriends - disable friends buttons (admin only)
// pop - pop game in a new message
// remind - remind players that didn't vote
// help - about this bot
// #remindAll - remind players that didn't vote and people who voted 'maybe'

function isCommand(text, command) {
    return text == `/${command}@${BOT.name()}` || text == `/${command}`;
}

function handleMessage(requestBody) {
    text = requestBody.message.text;
    if (isCommand(text, "newgame")) {
        newGameCommand(requestBody.message);
    }
    if (isCommand(text, "pop")) {
        popCommand(requestBody.message);
    }
    if (isCommand(text, "allowfriends")) {
        allowFriendsCommand(requestBody.message);
    }
    if (isCommand(text, "forbidfriends")) {
        forbidFriendsCommand(requestBody.message);
    }
    if (isCommand(text, "remind")) {
        remindCommand(requestBody.message);
    }
    if (isCommand(text, "help")) {
        helpCommand(requestBody.message);
    }
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
            logger.log(`got message. update_id=${requestBody.update_id}`);
            handleMessage(requestBody);
        }
    })
}
  