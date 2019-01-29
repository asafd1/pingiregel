const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var _ = require("underscore");


var WAZE_DEEP_LINK = "https://www.waze.com/ul?ll=32.13038646%2C34.83800054&navigate=yes&zoom=17";
var TARGET_NUMBER_OF_PLAYERS = 9;

const certificatePath = "./creds/pingiregel-public.pem";
var pingiregelGroupChatId = "-1001428218098"; // default, MyTestBot group chat id

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
    console.log(`setting webhook ${url} with certificate ${opts.certificate}`);
    bot.setWebHook(url, opts, { contentType: "application/octet-stream" } );
  }).catch((e) => {
    console.log(e);
    throw e;
  });
  return bot;
}

function initBot(token) {
  bot = new TelegramBot(token, {polling: false}); 
  bot.getMe().then((me)=>console.log("Bot started: " + me.username));
  
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

exports.getResults = function() {
  return DB.getPlayers().then((players) => {
    var results = _.groupBy(players, "vote");
    return results;
  });
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
    bot.editMessageReplyMarkup({inline_keyboard}, {chat_id: pingiregelGroupChatId, message_id: messageId});
  }
}

function shouldShowNavigationButton(results) {
  return results && results.yes.length >= TARGET_NUMBER_OF_PLAYERS;
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

function getPollKeyboard(gameId, results, expand) {
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
  
  var totalVotes = _.map(results, (member) => {member.length});

  inline_keyboard = [];
  inline_keyboard.push(
    [{"text": yesText, "callback_data":`poll.${gameId}.yes`},
     {"text": maybeText, "callback_data":`poll.${gameId}.maybe`},
     {"text": noText, "callback_data":`poll.${gameId}.no`}]);
  
  if (totalVotes.length > 0) {
    if (expand) {
      inline_keyboard.push(
        [{"text": getNames(results.yes), "callback_data":`none`},
        {"text": getNames(results.maybe), "callback_data":`none`},
        {"text": getNames(results.no), "callback_data":`none`}]);
    }
    
    if (expand) {
      inline_keyboard.push(
        [{"text": "צמצם לי", "callback_data":`collapse.${gameId}`}]);
    } else {
      inline_keyboard.push(
        [{"text": "פרט לי", "callback_data":`expand.${gameId}`}]);
    }
  }

  if (shouldShowNavigationButton(results)) {
    inline_keyboard.push(
        [{"text": "נווט אותי", "url": WAZE_DEEP_LINK}]);
  }

  return inline_keyboard;
}

exports.sendPoll = function (gameId, day, hour, title, results, messageId, expand) {
  console.log(messageId ? "updating poll" : "sending poll");

  inline_keyboard = getPollKeyboard(gameId, results, expand);
  
  var question = `מגיע לכדורגל ביום ${day} ב-${hour} ב${title}?`;
  if (!messageId) {
    sendMessage(question, inline_keyboard);
  } else {
    editMessageReplyMarkup(messageId, inline_keyboard);
  }
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
  console.log(requestBody.message);
  // commands are handled according to registerCommands
  bot.processUpdate(requestBody);
}


