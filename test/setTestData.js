var BOT = require("../src/bot");
var DB = require("../src/db");
var Game = require("../src/game");
var Player = require("../src/player");
var Chat = require('../src/chat.js');
var _ = require("underscore");
var logger = require('../src/logger');

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];
const CHAT_ID = 1111;

function addChat(db) {
    chat = new Chat({
        id: CHAT_ID,
        title: "my chat",
    })

    return db.setChat(chat);
}

async function addPlayer(db, id, username, fname, lname) {
    player = new Player(id, username, fname, lname);
    console.log("1");
    await db.deletePlayer(CHAT_ID, id);
    console.log("2");
    obj = await db.addPlayer(CHAT_ID, player);
    console.log("3");
    return obj;
}

async function setData(db) {
    await addChat(db);
    await addPlayer(db, "1", null, "adi", "gordon");
    await addPlayer(db, "2", null, "papi", "turgeman");
    await addPlayer(db, "3", "dorons", "doron", "shefa");
    // addChat(db).then(() => 
    //     addPlayer(db, "1", null, "adi", "gordon").then(() => 
    //         db.close()));
}

p = DB.connect();
p.then((db) => {
    setData(db).
        then(() => db.close());
});

