class Chat {
    constructor(chat) {
        this.id = chat.id;
        this.title = chat.title;
        this.admins = chat.admins;
        this.venue = chat.venue;
        this.time = chat.time;
    }

    addAdmin(adminId) {
        if (!this.admins) {
            this.admins = [];
        }
        this.admins.push(adminId);
    }
  
    isAdmin(adminId) {
        if (!this.admins) {
            return false;
        }
        return this.admins.indexOf(adminId) >= 0;
    }

    static setChats(chats) {
        Chat.chats = chats;
    }

    static byId(id) {
        return Chat.chats.find(chat => chat.id == id);
    }
}

Chat.chats = [];

module.exports = Chat;

