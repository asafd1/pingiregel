exports.init = function (db) {
    DB = db;
    return this;
}

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

console.log(getDefaultTime());

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

exports.create = function (time, venue) {
    var game = {};
    
    if (typeof time === 'undefined') {
        game.time = getDefaultTime();
    } else {
        game.time = time;
    }

    if (typeof venue === 'undefined') {
        game.venue = getDefaultVenue();
    } else {
        game.venue = venue;
    }

    return game;
}
