class Chat {
    constructor(chat) {
        this.id = chat.id;
        this.title = chat.title;
        this.admins = chat.admins;

        if (chat.venue) {
            this.venue = chat.venue;
        }

        if (chat.hour) {
            this.hour = chat.hour;
        }

        if (chat.dayOfWeek) {
            this.dayOfWeek = chat.dayOfWeek;
        }
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
}

module.exports = Chat;

