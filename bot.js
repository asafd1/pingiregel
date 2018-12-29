const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');

const certificatePath = "./creds/pingiregel-public.pem";
const GROUP_CHAT_ID = "-1001428218098";

var DB;
var token;
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

exports.init = function (db) {
  DB = db;
  DB.getMisc("token")
  .then((value) => {return value;})
  .then((doc) => initBot(doc.value))
  .then((bot) => {setWebHook(bot)});
}

exports.sendPoll = function (day, hour, title) {
  console.log("sending poll");
  const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{"text":"כן", "callback_data":"yes"},{"text":"אולי", "callback_data":"maybe"},{"text":"לא", "callback_data":"no"}]
      ],
      "resize_keyboard" : true,
    })
  };
  
  var question = `מגיע לכדורגל ביום ${day} ב-${hour} ב${title}?`;
  console.log()
  bot.sendMessage(GROUP_CHAT_ID, question, opts);
}

function sendVenue(chatId, game) {
  bot.sendVenue(chatId, game.venue.location.latitude, game.venue.location.longtitude, game.venue.title, game.venue.address);
}

exports.callbackReply = function(callback_query) {
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
