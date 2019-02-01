var _ = require("underscore");

// Constructor
function Player(id, username, firstname, lastname, vote, historicVotes, joinedAt) {
    this._id = id;
    this.username = username;
    this.firstname = firstname;
    this.lastname = lastname;
    this.vote = vote;
    this.historicVotes = historicVotes;
    this.joinedAt = joinedAt;

    this.getId = function () {
        return this._id;
    }

    this.getVote = function () {
        return this.vote;
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
}

Player.createPlayerFromDb = function (player) {
    return new Player(player._id, player.username, player.firstname, player.lastname, player.vote, player.historicVotes, player.joinedAt);
} 

module.exports = Player;