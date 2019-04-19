class Player {
    constructor(id, username, firstname, lastname, vote, historicVotes, joinedAt) {
        this._id = id.toString(); // convert all IDs to string since friend's IDs are strings
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.vote = vote;
        this.friends = 0;
        this.historicVotes = historicVotes;
        this.joinedAt = joinedAt;
        this.friends;
    }

    getId() {
        return this._id;
    }

    getFirstName() {
        return this.firstname;
    }

    getLastName() {
        return this.lastname;
    }

    getVote() {
        return this.vote;
    }

    resetVote() {
        this.vote = "nill";
    }

    setVote(gameId, vote) {
        this.vote = vote;
        if (!this.historicVotes) {
            this.historicVotes = {};
        }
        this.historicVotes[gameId] = vote;
    }
    
    setJoinedAt(time) {
        this.joinedAt = time;
    }

    getFriends() {
        return this.friends;
    }

    isFriend(otherPlayer) {
        return (otherPlayer._id.startsWith(`${this._id}.friend`));
    }
    
    setFriends(players) {
        this.friends = players.filter((player) => {
            return this.isFriend(player);
        });
    }

    getNextFriendNumber() {
        if (!this.friends) {
            return 1;
        }
        return this.friends.length + 1;
    }

    getNextFriendId() {
        if (!this.friends) {
            return 0;
        }
        return this._id + ".friend" + this.friends.length;
    }

    getLastFriendId() {
        if (!this.friends) {
            return null;
        }
        return this._id + ".friend" + (this.friends.length - 1);
    }
}

Player.fromDb = function (player) {
    return new Player(player._id._id, 
                      player.username, 
                      player.firstname, 
                      player.lastname, 
                      player.vote, 
                      player.historicVotes, 
                      player.joinedAt);
} 

module.exports = Player;