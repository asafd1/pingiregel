const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');

var DB;
var token;
var bot;

//Promise.config({ cancellation: true });
process.env.NTBA_FIX_350 = 1;

function setWebHook(bot) {
  DB.getSetting("baseUrl").then((value) => {
    url = value.value + "/webhook";
    console.log("webhook url="+url);
    bot.setWebHook(url, { certificate : "./creds/pingiregel-public.pem" }, { contentType: "application/octet-stream" } );
  }).catch((e) => {
    console.log(e);
    throw e;
  });
}

function initBot(token) {
  bot = new TelegramBot(token, {polling: false}); 
  return bot;
}

exports.init = function (db) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => {setWebHook(bot)});
}

exports.sendPoll = function () {
  console.log("sending poll");
  const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{"text":"כן", "callback_data":"yes"},{"text":"אולי", "callback_data":"maybe"},{"text":"לא", "callback_data":"no"}]
      ],
      "resize_keyboard" : true,
    })
  };
  bot.sendMessage("-1001428218098", "מגיע?", opts);
}

function handleVote(callback_query) {
  response = "Thank you " + 
              callback_query.from.first_name + 
              " for voting " + 
              callback_query.data;
  bot.answerCallbackQuery(callback_query.id, response);
}

exports.handleCallback = function (requestBody) {
  console.log(requestBody.callback_query);
  handleVote(requestBody.callback_query);
}
