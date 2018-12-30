const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

function getDefaultTime() {
    dayOfWeek = 4; // Thursday
    hour = 19; // 19:00

    var resultDate = new Date();
    resultDate.setDate(resultDate.getDate() + (7 + dayOfWeek - resultDate.getDay()) % 7);
    hour -= resultDate.getTimezoneOffset() / 60;
    
    resultDate.setHours(hour);
    resultDate.setMinutes(0);
    resultDate.setSeconds(0);

    return resultDate;
}

function getDefaultVenue() {
    return venue = {
        location : {
            longtitude : 34.835400,
            latitude : 32.138170
        },
        title	: "מרכז הטניס",
        address	: "דרך הטניס 6, רמת השרון"
    };
}

// Constructor
function Game(time, venue, lastSent, status) {
    if (!time) {
        this.time = getDefaultTime();
    } else {
        this.time = time;
    }

    if (!venue) {
        this.venue = getDefaultVenue();
    } else {
        this.venue = venue;
    }
    
    this.id = null;
    this.lastSent = lastSent;
    this.status = status ? status : "open";

    this.getId = function () {
        return this.id;
    }

    this.getDayOfWeek = function () {
        return daysOfWeek[this.time.getDay()];
    }
    
    this.getHour = function () {
        return hour = (this.time.getHours() + (this.time.getTimezoneOffset() / 60)) + ":00";
    }

    this.setId = function (_id) {
        this.id = _id.toHexString();
    }
}

Game.createGameFromDb = function (game) {
    g = new Game(game.time, game.venue, game.lastSent, game.status);
    g.setId(game._id);
    return g;
} 

module.exports = Game;