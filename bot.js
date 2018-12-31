const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var _ = require("underscore");

const certificatePath = "./creds/pingiregel-public.pem";
var pingiregelGroupChatId = "-1001428218098"; // default, MyTestBot group chat id

var DB;
var bot;


//Promise.config({ cancellation: true });
process.env.NTBA_FIX_350 = 1;

function setWebHook(bot) {
  DB.getSetting("baseUrl").then((doc) => {
    url = doc.value + "/webhook";
    console.log("webhook url="+url);
    var opts = {};
    if (fs.existsSync(certificatePath)) {
      opts = { certificate : certificatePath };
    }
    bot.setWebHook(url, opts, { contentType: "application/octet-stream" } );
  }).catch((e) => {
    console.log(e);
    throw e;
  });
  return bot;
}

function initBot(token) {
  bot = new TelegramBot(token, {polling: false}); 
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
// who - ?מי מגיע
// when - ?מתי המשחק
// where - ?איפה המשחק
// what - ?איפה המשחק? מתי? מי מגיע

function startCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
}
function helpCommand(msg, match) {
  sendMessage(`Hi, I am the Pingiregel bot (${msg.text})`);
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
  DB.getPlayers().then((players) => {
    var results = _.groupBy(players, "vote");
    results.yes = _.map(results.yes, (player) => { 
      return player.firstname; 
    })
    results.maybe = _.map(results.maybe, (player) => { 
      return player.firstname; 
    })
    results.no = _.map(results.no, (player) => { 
      return player.firstname; 
    })
    var text = results.yes + `: (${results.yes.length}) כן\n`;
    text += (!_.isEmpty(results.maybe) ? results.maybe : " ") + `: (${results.maybe.length}) אולי\n`;
    text += (!_.isEmpty(results.no) ? results.no : " ") + `: (${results.no.length}) לא\n`;
    sendMessage(text);
  });
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

exports.init = function (db) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => realizeGroupChatId(bot))
  .then((bot) => setWebHook(bot))
  .then((bot) => registerCommands(bot));
}

function sendMessage(text, inline_keyboard) {
  var opts = {};
  if (inline_keyboard) {
    opts = {
      reply_markup: JSON.stringify({
        inline_keyboard,
        resize_keyboard : true,
      })
    };
  }
  bot.sendMessage(pingiregelGroupChatId, text, opts);

}

exports.sendPoll = function (gameId, day, hour, title, results, messageId) {
  console.log(messageId ? "updating poll" : "sending poll");
  var yesText = "כן";
  var maybeText = "אולי";
  var noText = "לא";

  if (results && results.yes && (votes = results.yes.length) > 0) {
    yesText = `כן (${votes})`
  }
  if (results && results.maybe && (votes = results.maybe.length) > 0) {
    maybeText = `אולי (${votes})`
  }
  if (results && results.no && (votes = results.no.length) > 0) {
    noText = `לא (${votes})`
  }
  
  inline_keyboard = [
    [{"text": yesText, "callback_data":`poll.${gameId}.yes`},
     {"text": maybeText, "callback_data":`poll.${gameId}.maybe`},
     {"text": noText, "callback_data":`poll.${gameId}.no`}]
  ];
  
  var question = `מגיע לכדורגל ביום ${day} ב-${hour} ב${title}?`;
  if (!messageId) {
    sendMessage(question, inline_keyboard);
  } else {
    bot.editMessageReplyMarkup({inline_keyboard}, {chat_id: pingiregelGroupChatId, message_id: messageId});
  }
}

function sendVenue(chatId, game) {
  bot.sendVenue(chatId, game.venue.location.latitude, game.venue.location.longtitude, game.venue.title, game.venue.address);
}

exports.callbackReply = function(callback_query, vote) {
  response = "Thank you " + 
              callback_query.from.first_name + 
              " for voting " + 
              vote;
  bot.answerCallbackQuery(callback_query.id, response);
}

exports.handleMessage = function (requestBody) {
  console.log(requestBody.message);
  bot.processUpdate(requestBody);
}


