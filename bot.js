const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var _ = require("underscore");
var logger = require('./logger');

var WAZE_DEEP_LINK = "https://www.waze.com/ul?ll=<LAT>%2C<LONG>&navigate=yes&zoom=17";
var config = {};

const certificatePath = "./creds/pingiregel-public.pem";
var pingiregelGroupChatId = null;

var DB;
var bot;


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
  bot.getMe().then((me)=>logger.log("Bot started: " + me.username));
  
  return bot;
}

function realizeGroupChatId(bot) {
  DB.getSetting("chatId").then((d) => {
    if (d && d.value) {
      pingiregelGroupChatId = d.value;
    }
  });
  return bot;
}

// /setcommands
// test - קצת עזרה לא תזיק
// start - תתחיל אותי
// who - ?מי מגיע
// when - ?מתי המשחק
// where - ?איפה המשחק
// what - ?איפה המשחק? מתי? מי מגיע

function startCommand(msg, match) {
  if (msg.from.id == 509453115) {
    pingiregelGroupChatId = msg.chat.id;
    DB.deleteSetting("chatId");
    DB.addSetting({key:"chatId", value:pingiregelGroupChatId});
  }
  sendMessage(`סבבה, אני אתחיל לשלוח סקר שחקנים כל יום ראשון`);
}
function helpCommand(msg, match) {
  sendMessage(`לא יודע איך לעזור בינתיים`);
}
function settingsCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}
function whereCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}
function whenCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}
function whoCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}
function whatCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}

function registerCommands(bot) {
  // bot.onText(/\/echo (.+)/, (msg, match) => {
  //   const chatId = msg.chat.id;
  //   const resp = match[1]; // the captured "whatever"

  bot.onText(/\/start/, startCommand);
  bot.onText(/\/help/, helpCommand);
  bot.onText(/\/settings/, settingsCommand);
  bot.onText(/\/where/, whereCommand);
  bot.onText(/\/when/, whenCommand);
  bot.onText(/\/who/, whoCommand);
  bot.onText(/\/what/, whatCommand);  
}

exports.init = function (db, config) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => realizeGroupChatId(bot))
  .then((bot) => setWebHook(bot))
  .then((bot) => registerCommands(bot));

  this.config = config;
}

function sendMessage(text, inline_keyboard) {
  if (!pingiregelGroupChatId) {
    logger.log("bot not started. can't send message (no chat id)")
    return new Promise(() => {return 0});
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

function editMessageReplyMarkup(messageId, inline_keyboard) {
  var opts = {};
  if (inline_keyboard) {
    opts = {
      reply_markup: JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
        selective: true
      })
    };

    inline_keyboard_str = JSON.stringify(inline_keyboard);
    logger.log(`updating message. chat_id = '${pingiregelGroupChatId} 'messageId = '${messageId}' 'inline_keyboard' = '${inline_keyboard_str}'`);
    bot.editMessageReplyMarkup({inline_keyboard}, {chat_id: pingiregelGroupChatId, message_id: messageId}).
    catch((error) => {
      logger.log(error)
    });
  }

  return new Promise(() => {return messageId});
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
    return name;
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
    if (expand) {
      inline_keyboard.push(
        [{"text": getNames(results.yes), "callback_data":`none`},
        {"text": getNames(results.maybe), "callback_data":`none`},
        {"text": getNames(results.no), "callback_data":`none`}]);
    }
    
    if (friendsButtons) {
      var plusFriendText  = "+חבר";
      var minusFriendText = "-חבר"
  
      inline_keyboard.push(
        [{"text": plusFriendText, "callback_data":`poll.${game.getId()}.plus1`},
        {"text": minusFriendText, "callback_data":`poll.${game.getId()}.minus1`}]);
    }
  
    if (expand) {
      inline_keyboard.push(
        [{"text": "צמצם לי", "callback_data":`collapse.${game.getId()}`}]);
    } else {
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

exports.sendPoll = function (game, results, expand) {
  var messageId = game.getMessageId();
  logger.log(messageId ? "updating poll" : "sending poll");

  inline_keyboard = getPollKeyboard(game, results, expand, game.getAllowFriends());
  
  var question = `מגיע לכדורגל ביום ${game.getDayOfWeek()} ב-${game.getHour()} ב${game.venue.title}?`;
  if (!messageId) {
    p = sendMessage(question, inline_keyboard);
    return p.then((message) => {return message.message_id;});
  } else {
    return editMessageReplyMarkup(messageId, inline_keyboard);
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
  }
  response += " " + callback_query.from.first_name;
  bot.answerCallbackQuery(callback_query.id, response);
}

exports.handleMessage = function (requestBody) {
  logger.log(requestBody.message);
  // commands are handled according to registerCommands
  bot.processUpdate(requestBody);
}


