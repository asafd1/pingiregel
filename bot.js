const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');

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

exports.init = function (db) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => realizeGroupChatId(bot))
  .then((bot) => {setWebHook(bot)});
}

exports.sendPoll = function (gameId, day, hour, title, results, messageId) {
  console.log("sending poll");
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

  const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard,
      resize_keyboard : true,
    })
  };
  
  var question = `מגיע לכדורגל ביום ${day} ב-${hour} ב${title}?`;
  if (!messageId) {
    bot.sendMessage(pingiregelGroupChatId, question, opts);
  } else {
    bot.editMessageReplyMarkup({inline_keyboard}, {chat_id: GROUP_CHAT_ID, message_id: messageId});
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

exports.handleCallback = function (requestBody) {
  console.log(requestBody.callback_query);
  handleVote(requestBody.callback_query);
}
