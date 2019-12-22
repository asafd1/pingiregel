var BOT = require("../src/bot");
var DB = require("../src/db");
var Game = require("../src/game");
var Player = require("../src/player");
var Chat = require('../src/chat.js');
var _ = require("underscore");
var logger = require('../src/logger');

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

function addChat(db) {
    chat = new Chat({
        id: 1111,
        title: "my chat",
    })

    return db.setChat(chat);
}

async function addPlayer(db, id, username, fname, lname) {
    player = new Player(id, username, fname, lname);
    await db.deletePlayer(1111, id);
    return db.addPlayer(1111, player);
}

async function setData(db) {
    addChat(db);
    await addPlayer(db, "1", null, "adi", "gordon");
    await addPlayer(db, "2", null, "papi", "turgeman");
    // addChat(db).then(() => 
    //     addPlayer(db, "1", null, "adi", "gordon").then(() => 
    //         db.close()));
}

p = DB.connect();
p.then((db) => {
    setData(db).then(() => db.close());
});

