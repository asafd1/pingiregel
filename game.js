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
function Game(_time, _venue) {
    if (typeof _time === 'undefined') {
        this.time = getDefaultTime();
    } else {
        this.time = _time;
    }

    if (typeof _venue === 'undefined') {
        this.venue = getDefaultVenue();
    } else {
        this.venue = _venue;
    }
    
    this.lastSent = null;
    this.status = "open";

    this.getDayOfWeek = function () {
        return daysOfWeek[this.time.getDay()];
    }
    
    this.getHour = function () {
        return hour = (this.time.getHours() + (this.time.getTimezoneOffset() / 60)) + ":00";
    }
}

module.exports = Game;