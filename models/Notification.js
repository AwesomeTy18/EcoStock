const fs = require('fs');
const path = require('path');

class Notification {
    constructor(user_id, message) {
        this.notification_id = Date.now();
        this.user_id = user_id;
        this.message = message;
        this.is_read = false;
        this.created_at = new Date();
    }

    save() {
        const notifications = JSON.parse(fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8'));
        notifications.push(this);
        fs.writeFileSync(path.join(__dirname, 'notifications.json'), JSON.stringify(notifications, null, 2));
    }

    static findByUserId(user_id) {
        const notifications = JSON.parse(fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8'));
        return notifications.filter(notification => notification.user_id === user_id);
    }

    static markAsRead(notification_id) {
        const notifications = JSON.parse(fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8'));
        const notification = notifications.find(n => n.notification_id === notification_id);
        if (notification) {
            notification.is_read = true;
            fs.writeFileSync(path.join(__dirname, 'notifications.json'), JSON.stringify(notifications, null, 2));
            return notification;
        }
        return null;
    }
}

module.exports = Notification;