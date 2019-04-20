var Player = require("../player");

date = new Date("2019-03-21 21:00:00");
dbPlayer = { _id : {_id : "123", chatId : 1}, 
            username : "username",
            firstname : "asaf",
            lastname : "david",
            vote: "yes",
            historicVotes : { 1 : "yes"},
            joinedAt : date
            }

test('create player from app', () => {
    player = new Player ("123", "username", "asaf", "david");
    expect(player.getId()).toBe("123");
    expect(player.getFirstName()).toBe("asaf");
    expect(player.getLastName()).toBe("david");
    expect(player.getVote()).toBeUndefined();
});


test('create player from db', () => {
    player = Player.fromDb(dbPlayer);
    expect(player.getId()).toBe("123");
    expect(player.getFirstName()).toBe("asaf");
    expect(player.getLastName()).toBe("david");
    expect(player.getVote()).toBe("yes");
});


test('handle votes', () => {
    player = Player.fromDb(dbPlayer);
    player.setVote(2, "no");
    expect(player.getVote()).toBe("no");
    expect(player.historicVotes[1]).toBe("yes");
    expect(player.historicVotes[2]).toBe("no");
    player.resetVote();
    expect(player.getVote()).toBe("nill");
    expect(player.historicVotes[1]).toBe("yes");
    expect(player.historicVotes[2]).toBe("no");
});

test('handle friends', () => {
    player = Player.fromDb(dbPlayer);
    expect(player.getFriends()).toBeUndefined();
    expect(player.getNextFriendId()).toBe(0);
    expect(player.getLastFriendId()).toBe(null);
    otherPlayer = new Player ("123.friend.1", "123.friend.1", "adi", "gordon");
    expect(player.isFriend(otherPlayer)).toBeTruthy();
    otherPlayers = [new Player ("123.friend.1", "123.friend.1", "adi", "gordon"),
                    new Player ("123.friend.2", "123.friend.2", "papi"),
                    new Player ("456", "un2", "avi", "gez"),
                    new Player ("789", "un3", "beni", "ganz"),
                    ];
    player.setFriends(otherPlayers);
    expect(player.getFriends()[0].getFirstName()).toBe("adi");
    expect(player.getFriends()[1].getFirstName()).toBe("papi");
    expect(player.getNextFriendNumber()).toBe(3);
    expect(player.getNextFriendId()).toBe("123.friend2");
    expect(player.getLastFriendId()).toBe("123.friend1");
});
