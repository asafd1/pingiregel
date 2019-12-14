const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const IST = 2;

function getDefaultTime(hour = 17 /* 19:00 IST */, dayOfWeek = 4 /* Thursday */) {
    var resultDate = new Date();
    resultDate.setDate(resultDate.getDate() + (7 + dayOfWeek - resultDate.getDay()) % 7);
    resultDate.setUTCHours(hour);
    resultDate.setMinutes(0);
    resultDate.setSeconds(0);

    return resultDate;
}

function getDefaultVenue() {
    return venue = {
        location : {
            longtitude : 34.83800054,
            latitude : 32.13038646
        },
        title	: "מרכז הטניס",
        address	: "דרך הטניס 6, רמת השרון"
    };
}

// Constructor
function Game(hour, dayOfWeek, venue, lastSent, status, allowFriends, messageId) {
    this.time = getDefaultTime(hour, dayOfWeek);

    if (!venue) {
        this.venue = getDefaultVenue();
    } else {
        this.venue = venue;
    }
    
    this._id = (this.time.getFullYear() * 10000) + ((this.time.getMonth()+1) * 100) + (this.time.getDate());
    this.lastSent = lastSent;
    this.status = status ? status : "open";
    this.messageId = messageId;
    this.allowFriends = allowFriends ? allowFriends : false;

    this.getId = function () {
        return this._id;
    }

    this.getDayOfWeek = function () {
        return daysOfWeek[this.time.getDay()];
    }
    
    this.getHour = function () {
        return hour = (this.time.getHours() + (this.time.getTimezoneOffset() / 60) + IST) + ":00";
    }

    this.setId = function (_id) {
        this._id = _id;
    }

    this.setChatId = function (chatId) {
        this.chatId = chatId;
    }

    this.getChatId = function () {
        return this.chatId;
    }

    this.setMessageId = function (messageId) {
        this.messageId = messageId;
    }

    this.getMessageId = function () {
        return this.messageId;
    }

    this.setAllowFriends = function (allow) {
        this.allowFriends = allow;
    }

    this.getAllowFriends = function () {
        return this.allowFriends;
    }

    this.setLastSent = function (time) {
        this.lastSent = time;
    }

    this.getLastSent = function () {
        return this.lastSent;
    }
}

Game.createGameFromDb = function (game) {
    g = new Game(game.hour, game.dayOfWeek, game.venue, game.lastSent, game.status, game.allowFriends, game.messageId);
    g.setId(game._id._id);
    g.setChatId(game._id.chatId);
    return g;
} 

module.exports = Game;