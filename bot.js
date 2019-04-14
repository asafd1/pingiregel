const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var _ = require("underscore");
var httpContext = require('express-http-context');
var logger = require('./logger');
var Chat = require('./chat.js');
var CRYPTO = require("./crypto");

var chats = [];

var WAZE_DEEP_LINK = "https://www.waze.com/ul?ll=<LAT>%2C<LONG>&navigate=yes&zoom=17";
var config = {};
const certificatePath = "./creds/pingiregel-public.pem";
const ENCRYPTED_GLOBAL_ADMINS = ["008e0c277bf2ceb9f22da3d2aa0fffea"];
let GLOBAL_ADMINS;

var DB;
var bot;
var botName;

//Promise.config({ cancellation: true });
process.env.NTBA_FIX_350 = 1;

function setWebHook(bot) {
  DB.getSetting("baseUrl").then((doc) => {
    url = doc.value + "/webhook";
    var opts = {};
    if (fs.existsSync(certificatePath)) {
      opts = { certificate : certificatePath };
    }
    logger.log(`setting webhook ${url} with certificate ${opts.certificate}`);
    bot.setWebHook(url, opts, { contentType: "application/octet-stream" } );
  }).catch((e) => {
    logger.log(e);
    throw e;
  });
  return bot;
}

function initBot(token) {
  bot = new TelegramBot(token, {polling: false}); 
  bot.getMe().then((me)=> {
    botName = me.username;
    logger.log("Bot started: " + botName);
  });

  GLOBAL_ADMINS = ENCRYPTED_GLOBAL_ADMINS.map(ga => parseInt(CRYPTO.decryptSync(ga)));

  return bot;
}

exports.getChatSettings = function (id) {
  return chats.find(chat => chat.id == id);
}

function getAdmins(){
  let admins = []
  let chat = chats.find(_chat => _chat.id == getChatId());
  if (chat) {
    admins = chat.admins;
  }

  return admins.concat(GLOBAL_ADMINS);
}

exports.name = function () {
  return botName;
}

exports.isAdmin = function (user) {
  let admins = getAdmins();
  
  if (admins.indexOf(user.id) >= 0) {
    return true;
  } else {
    logger.log(`${user.id} (${user.first_name} , ${user.last_name}) is not an admin`);
    return false;
  }
}

exports.init = function (db, config) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => setWebHook(bot));

  this.config = config;
}

function getChatId() {
  var message = httpContext.get('message');
  if (message) {
      return httpContext.get('message').chat.id;
  }
}

function sendMessage(text, inline_keyboard) {
  if (!getChatId()) {
    logger.log("no chat id. can't send message")
    return Promise.resolve(0);
  }

  var opts = { parse_mode : "Markdown" };
  if (inline_keyboard) {
    opts.reply_markup = JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
      });
  }

  logger.log(`sending message. text = '${text}'`);
  p = bot.sendMessage(getChatId(), text, opts);
  p.then((message) => {
    logger.log(`message sent. messageId=${message.message_id}`);
  }).catch((e) => {
    logger.log(`error: ${e}`);
  });

  return p;
}

exports.sendMessage = function (text, inline_keyboard) {
  return sendMessage(text, inline_keyboard);
}

function deleteMessage(messageId) {
  logger.log(`deleting message. 'messageId = '${messageId}'`);
  bot.deleteMessage(getChatId(), messageId).catch((e) => {
    logger.log(`error: ${e}`);
  });
}

function editMessage(messageId, text, inline_keyboard) {
  var opts = { parse_mode : "Markdown" };
  opts.chat_id = getChatId();
  opts.message_id =  messageId;

  if (inline_keyboard) {
    opts.reply_markup = JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
        selective: true
    });
  };

  inline_keyboard_str = JSON.stringify(inline_keyboard);
  logger.log(`updating message. 'messageId = '${messageId}' 'inline_keyboard' = '${inline_keyboard_str}'`);
  bot.editMessageText(text, opts).catch((e) => {
    logger.log(`error: ${e}`);
  });

  return Promise.resolve(messageId);
}

function shouldShowNavigationButton(results) {
  return results && results.yes && results.yes.length >= config.targetNumberOfPlayer;
}

function getPollKeyboard(game, results, friendsButtons) {
  var yesText = "כן";
  var maybeText = "אולי";
  var noText = "לא";

  if (results && results.yes && (votes = results.yes.length) > 0) {
    yesText = `כן (${votes})`;
  }
  if (results && results.maybe && (votes = results.maybe.length) > 0) {
    maybeText = `אולי (${votes})`
  }
  if (results && results.no && (votes = results.no.length) > 0) {
    noText = `לא (${votes})`
  }
  
  var totalVotes = _.map(results, (member) => {return member.length});

  inline_keyboard = [];
  inline_keyboard.push(
    [{"text": yesText, "callback_data":`poll.${game.getId()}.yes`},
     {"text": maybeText, "callback_data":`poll.${game.getId()}.maybe`},
     {"text": noText, "callback_data":`poll.${game.getId()}.no`}]);
  
  if (totalVotes.length > 0) {    
    if (friendsButtons) {
      var plusFriendText  = "+חבר";
      var minusFriendText = "-חבר"
  
      inline_keyboard.push(
        [{"text": plusFriendText, "callback_data":`poll.${game.getId()}.plus1`},
        {"text": minusFriendText, "callback_data":`poll.${game.getId()}.minus1`}]);
    }
  }

  if (shouldShowNavigationButton(results)) {
    var url = WAZE_DEEP_LINK;
    url = url.replace("<LAT>", game.venue.location.latitude);
    url = url.replace("<LONG>", game.venue.location.longtitude);
    inline_keyboard.push(
        [{"text": "נווט אותי", "url": url}]);
  }

  return inline_keyboard;
}

function getNames(players) {
  names = _.map(players, (player) => {
    name = player.firstname;
    if (player.lastname) {
      name +=  " " + player.lastname;
    }
    if (player.getId().indexOf(".friend") > 0) {
      return " " + name;
    }
    return ` [${name}](tg://user?id=${player.getId()})`;
  });

  return names.length > 0 ? names.join() : "אף אחד";
}

function getLengthText(title, votes) {
  length = votes && votes.length > 0 ? `(${votes.length})` : "";
  return `${title} ${length}: `
}

function getText(game, results) {
  var text = `מגיע למשחק ביום ${game.getDayOfWeek()} ב-${game.getHour()} ב${game.venue.title}?`;

  if (results) {
    text += "\n";
    text += "\n*" + getLengthText('באים', results.yes) + "*";
    text += getNames(results.yes);
    text += "\n" + getLengthText('אולי', results.maybe);
    text += getNames(results.maybe);
    text += "\n" + getLengthText('לא', results.no);
    text += getNames(results.no);
    text += "\n" + getLengthText('לא הצביעו', results.nill);
    text += getNames(results.nill);
    text += "\n\n";
  }
  return text;
}

exports.closePoll = function (messageId) {
  editMessage(messageId, "סקר נסגר");
}

exports.sendPoll = function (game, results, resend = false) {
  var messageId = game.getMessageId();
  logger.log(messageId ? "updating poll" : "sending poll");

  inline_keyboard = getPollKeyboard(game, results, game.getAllowFriends());
  
  var text = getText(game, results);
  if (resend && messageId) {
    editMessage(messageId, "סקר נסגר");
    deleteMessage(messageId);
  }

  if (!messageId || resend) {
    p = sendMessage(text, inline_keyboard);
    return p.then((message) => {return message.message_id;});
  } else {
    return editMessage(messageId, text, inline_keyboard);
  }
}

exports.sendReminder = function (game, players) {
  var text = "נא להצביע";
  text += " ";

  mentions = _.map(players, (player) => {
    return `[${player.firstname}](tg://user?id=${player.getId()})`;
  });

  text += mentions.join();

  sendMessage(text);
}

exports.callbackReply = function(callback_query, vote) {
  var response;
  switch (vote) {
    case "yes":
      response = "מגניב";
      break;
    case "maybe":
      response = "מחזיק לך אצבעות";
      break;
    case "no":
      response = "מקווה שתשנה את דעתך";
      break;
    case "plus1":
    case "minus1":
      response = "תודה";
      break;
  }
  response += " " + callback_query.from.first_name;
  bot.answerCallbackQuery(callback_query.id, response).catch((e) => {
    logger.log(`error: ${e}`);
  });;
}

// exports.handleMessage = function (requestBody) {
//   logger.log(requestBody.message);
//   // commands are handled according to registerCommands
//   bot.processUpdate(requestBody);
// }


