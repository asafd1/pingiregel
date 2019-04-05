var _ = require("underscore");

// Constructor
function Player(id, username, firstname, lastname, vote, historicVotes, joinedAt) {
    this._id = id.toString(); // convert all IDs to string since friend's IDs are strings
    this.username = username;
    this.firstname = firstname;
    this.lastname = lastname;
    this.vote = vote;
    this.friends = 0;
    this.historicVotes = historicVotes;
    this.joinedAt = joinedAt;
    this.friends;

    this.getId = function () {
        return this._id;
    }

    this.getFirstName = function () {
        return this.firstname;
    }

    this.getLastName = function () {
        return this.lastname;
    }

    this.getVote = function () {
        return this.vote;
    }

    this.resetVote = function () {
        this.vote = "nill";
    }

    this.setVote = function (gameId, vote) {
        this.vote = vote;
        if (!this.historicVotes) {
            this.historicVotes = {};
        }
        this.historicVotes[gameId] = vote;
    }
    
    this.setJoinedAt = function (time) {
        this.joinedAt = time;
    }

    this.getFriends = function () {
        return this.friends;
    }

    this.isFriend = function (otherPlayer) {
        return (otherPlayer._id.startsWith(`${this._id}.friend`));
    }
    
    this.setFriends = function (players) {
        this.friends = _.filter(players, (player) => {
            return this.isFriend(player);
        });
    }

    this.getNextFriendNumber = function () {
        if (!this.friends) {
            return 1;
        }
        return this.friends.length + 1;
    }

    this.getNextFriendId = function () {
        if (!this.friends) {
            return 0;
        }
        return this._id + ".friend" + this.friends.length;
    }

    this.getLastFriendId = function () {
        if (!this.friends) {
            return null;
        }
        return this._id + ".friend" + (this.friends.length - 1);
    }
}

Player.createPlayerFromDb = function (player) {
    return new Player(player._id, player.username, player.firstname, player.lastname, player.vote, player.historicVotes, player.joinedAt);
} 

Player.isAnyFriend = function (player) {
    return (player._id.indexOf(`.friend`) > 0);
}

module.exports = Player;