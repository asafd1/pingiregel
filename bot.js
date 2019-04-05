const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var _ = require("underscore");
var logger = require('./logger');

var WAZE_DEEP_LINK = "https://www.waze.com/ul?ll=<LAT>%2C<LONG>&navigate=yes&zoom=17";
var config = {};
var admins = [509453115, // asaf
              ];
const certificatePath = "./creds/pingiregel-public.pem";
var pingiregelGroupChatId = null;

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
  
  return bot;
}

exports.name = function () {
  return botName;
}

exports.isAdmin = function (user) {
  if (admins.indexOf(user.id) >= 0) {
    return true;
  } else {
    logger.log(`${user.id} (${user.first_name} , ${user.last_name}) is not an admin`);
  }
}

exports.setGroupChatId = function (msg) {
  pingiregelGroupChatId = msg.chat.id;
  DB.deleteSetting("chatId");
  DB.addSetting({key:"chatId", value:pingiregelGroupChatId});
}

function realizeGroupChatId(bot) {
  DB.getSetting("chatId").then((d) => {
    if (d && d.value) {
      pingiregelGroupChatId = d.value;
    }
  });
  return bot;
}

exports.init = function (db, config) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => realizeGroupChatId(bot))
  .then((bot) => setWebHook(bot));

  this.config = config;
}

function sendMessage(text, inline_keyboard) {
  if (!pingiregelGroupChatId) {
    logger.log("bot not started. can't send message (no chat id)")
    return new Promise((resolve, reject) => {
      resolve(0);
    });
  }

  var opts = { parse_mode : "Markdown" };
  if (inline_keyboard) {
    opts.reply_markup = JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
      });
  }

  logger.log(`sending message. text = '${text}'`);
  p = bot.sendMessage(pingiregelGroupChatId, text, opts);
  p.then((message) => {
    logger.log(`message sent. messageId=${message.message_id}`);
  })
  return p;
}

function editMessage(messageId, text, inline_keyboard) {
  var opts = { parse_mode : "Markdown" };
  opts.chat_id = pingiregelGroupChatId;
  opts.message_id =  messageId;

  if (inline_keyboard) {
    opts.reply_markup = JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
        selective: true
    });
  };

  inline_keyboard_str = JSON.stringify(inline_keyboard);
  logger.log(`updating message. chat_id = '${pingiregelGroupChatId} 'messageId = '${messageId}' 'inline_keyboard' = '${inline_keyboard_str}'`);
  bot.editMessageText(text, opts).
  catch((error) => {
    logger.log(error)
  });

  return new Promise((resolve, reject) => {
    resolve(messageId);
  });
}

function shouldShowNavigationButton(results) {
  return results && results.yes && results.yes.length >= config.targetNumberOfPlayer;
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

function getPollKeyboard(game, results, expand, friendsButtons) {
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
  
    if (!expand) {
      inline_keyboard.push(
        [{"text": "פרט לי", "callback_data":`expand.${game.getId()}`}]);
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

function getText(game, results, expand) {
  var text = `מגיע לכדורגל ביום ${game.getDayOfWeek()} ב-${game.getHour()} ב${game.venue.title}?`;

  if (expand && results) {
    text += "\n";
    lengthYes = results.yes ? `(${results.yes.length})` : "";
    lengthMaybe = results.maybe ? `(${results.maybe.length})` : "";
    lengthNo = results.no ? `(${results.no.length})` : "";
    text += "\n*" + `באים ${lengthYes}:* `;
    text += getNames(results.yes);
    text += "\n" + `אולי ${lengthMaybe}: `;
    text += getNames(results.maybe);
    text += "\n" + `לא ${lengthNo}: `;
    text += getNames(results.no);
    text += "\n\n";
  }
  return text;
}

exports.sendPoll = function (game, results, expand) {
  var messageId = game.getMessageId();
  logger.log(messageId ? "updating poll" : "sending poll");

  expand = true; // always expaned

  inline_keyboard = getPollKeyboard(game, results, expand, game.getAllowFriends());
  
  var text = getText(game, results, expand);
  if (!messageId) {
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
  bot.answerCallbackQuery(callback_query.id, response);
}

// exports.handleMessage = function (requestBody) {
//   logger.log(requestBody.message);
//   // commands are handled according to registerCommands
//   bot.processUpdate(requestBody);
// }


