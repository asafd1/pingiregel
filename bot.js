const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.argv[2];

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: false});

const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{"text":"כן", "callback_data":"yes"},{"text":"אולי", "callback_data":"maybe"},{"text":"לא", "callback_data":"no"}]
      ],
      "resize_keyboard" : true,
    })
  };
bot.sendMessage("-1001428218098", "מגיע?", opts);
