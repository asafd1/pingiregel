var Game = require("../game");

let _lastSent = new Date("2019-04-21 17:00:00Z");
dbGame = { _id : {_id : 20190425, chatId : 1}, 
            time : new Date("2019-04-25 19:00:00Z"),
            hour : 17,
            dayOfWeek : 4,
            venue : { title : "white house" },
            lastSent: _lastSent,
            status : "open",
            allowFriends : false
            }

test('check getDefaultTime', () => {
    _now = new Date("2019-04-21 17:00:00Z"); // Sunday
    expect(Game.getDefaultTime(_now)).toEqual(new Date("2019-04-25 17:00:00Z"));
    expect(Game.getDefaultTime(_now, 15)).toEqual(new Date("2019-04-25 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 3)).toEqual(new Date("2019-04-24 15:00:00Z"));

    _now = new Date("2019-04-21 17:00:00Z"); // Sunday (days of week: 0 = Sunday)
    expect(Game.getDefaultTime(_now, 15, 0)).toEqual(new Date("2019-04-21 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 1)).toEqual(new Date("2019-04-22 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 2)).toEqual(new Date("2019-04-23 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 3)).toEqual(new Date("2019-04-24 15:00:00Z"));

    _now = new Date("2019-04-25 17:00:00Z"); // Sunday
    expect(Game.getDefaultTime(_now, 15, 0)).toEqual(new Date("2019-04-28 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 1)).toEqual(new Date("2019-04-29 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 2)).toEqual(new Date("2019-04-30 15:00:00Z"));
    expect(Game.getDefaultTime(_now, 15, 3)).toEqual(new Date("2019-05-01 15:00:00Z"));
});

test('create game from app', () => {
    game = new Game(new Date("2019-04-21 17:00:00Z"));
    // expect(game.id).toBe(20190425);
});

test('create game from db', () => {
    game = Game.fromDb(dbGame);
    expect(game.id).toBe(20190425);
});

