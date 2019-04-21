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
    expect(player.getFriends()).toEqual([]);
    expect(player.getNextFriendNumber()).toBe(1);
    expect(player.getLastFriendId()).toBe(null);

    otherPlayers = [new Player ("456", "un2", "avi", "gez"),
                    new Player ("789", "un3", "beni", "ganz")];

    friend1 = { _id : player.getNextFriendId(), username : player.getNextFriendUsername() };
    expect(player.isFriend(friend1)).toBeTruthy();

    otherPlayers.push(new Player(friend1._id, friend1.username));
    player.setFriends(otherPlayers);
    expect(player.getFriends().length).toBe(1);
    expect(player.getFriends()[0].username).toBe("asaf's friend (1)");
    
    friend2 = { _id : player.getNextFriendId(), username : player.getNextFriendUsername() };
    expect(player.isFriend(friend2)).toBeTruthy();

    otherPlayers.push(new Player(friend2._id, friend2.username));
    player.setFriends(otherPlayers);
    expect(player.getFriends().length).toBe(2);
    expect(player.getFriends()[0].username).toBe("asaf's friend (1)");
    expect(player.getFriends()[1].username).toBe("asaf's friend (2)");

    expect(player.getNextFriendNumber()).toBe(3);
    expect(player.getNextFriendId()).toBe("123.friend2");
    expect(player.getLastFriendId()).toBe("123.friend1");
});
