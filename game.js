
class Game {
    static get daysOfWeek() {
        return ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    }

    static get IST() {
        return 2;
    }

    // Calculate the game time. The result will be the next requested dayOfWeek after the given 'now'.
    //  now - base time for calculation
    //  hour - desired hour of the day
    //  dayOfWeek - desired week day
    static getDefaultTime(now, hour = 17 /* 19:00 IST */, dayOfWeek = 4 /* Thursday */) {
        var resultDate = new Date(now.getTime());
        let dayOfMonth = resultDate.getDate() + (dayOfWeek - resultDate.getDay());
        if (dayOfMonth < resultDate.getDate()) {
            dayOfMonth += 7;
        }
        resultDate.setDate(dayOfMonth);
        resultDate.setUTCHours(hour);
        resultDate.setMinutes(0);
        resultDate.setSeconds(0);

        return resultDate;
    }

    static get defaultVenue() {
        let venue = {
            location : {
                longtitude : 34.83800054,
                latitude : 32.13038646
            },
            title	: "מרכז הטניס",
            address	: "דרך הטניס 6, רמת השרון"
        };
        return venue;
    }
    
    constructor(now, hour, dayOfWeek, venue, lastSent, status, allowFriends, messageId) {
        this._time = Game.getDefaultTime(now, hour, dayOfWeek);
    
        if (!venue) {
            this._venue = Game.defaultVenue;
        } else {
            this._venue = venue;
        }
        
        this._id = (this._time.getFullYear() * 10000) + ((this._time.getMonth()+1) * 100) + (this._time.getDate());
        this._lastSent = lastSent;
        this._status = status ? status : "open";
        this._messageId = messageId;
        this._allowFriends = allowFriends ? allowFriends : false;
    }

    get id() {
        return this._id;
    }

    get dayOfWeek() {
        return daysOfWeek[this._time.getDay()];
    }
    
    get hour() {
        return hour = (this._time.getHours() + (this._time.getTimezoneOffset() / 60) + IST) + ":00";
    }

    set id(id) {
        this._id = id;
    }

    set chatId(chatId) {
        this._chatId = chatId;
    }

    get chatId() {
        return this._chatId;
    }

    set messageId(messageId) {
        this._messageId = messageId;
    }

    get messageId() {
        return this._messageId;
    }

    set allowFriends(allow) {
        this._allowFriends = allow;
    }

    get allowFriends() {
        return this._allowFriends;
    }

    set lastSent(time) {
        this._lastSent = time;
    }

    get lastSent() {
        return this._lastSent;
    }

    static fromDb(game) {
        let g = new Game(game.time, game.hour, game.dayOfWeek, game.venue, game.lastSent, game.status, game.allowFriends, game.messageId);
        g.id = game._id._id;
        g.chatId = game._id.chatId;
        return g;
    }
}

module.exports = Game;