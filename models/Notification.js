const db = require('../db.js');

class Notification {
    constructor(notification_id, user_id, message, is_read, created_at) {
        this.notification_id = notification_id;
        this.user_id = user_id;
        this.message = message;
        this.is_read = is_read;
        this.created_at = created_at;
    }

    async save() {
        const sql = 'INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.user_id, this.message, this.is_read ? 1 : 0, new Date().toISOString()], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    static async findByUserId(user_id) {
        const sql = 'SELECT * FROM notifications WHERE user_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [user_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new Notification(row.notification_id, row.user_id, row.message, row.is_read, row.created_at));
        } catch (err) {
            throw err;
        }
    }

    static async markAsRead(notification_id) {
        const sql = 'UPDATE notifications SET is_read = 1 WHERE notification_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [notification_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM notifications;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="notifications";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const sampleNotifications = [
                {
                    notification_id: 601,
                    user_id: 7,
                    message: 'Your purchase of "Sunset Over Mountains" was successful.',
                    is_read: false,
                    created_at: '2023-09-01T10:05:00Z',
                },
                {
                    notification_id: 602,
                    user_id: 8,
                    message: 'Your payout of $425.00 is pending.',
                    is_read: false,
                    created_at: '2023-09-15T09:05:00Z',
                },
            ];

            for (const notificationData of sampleNotifications) {
                const notification = new Notification(
                    notificationData.notification_id, notificationData.user_id, notificationData.message,
                    notificationData.is_read, notificationData.created_at
                );
                await notification.save();
            }
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                is_read INTEGER,
                created_at TEXT
            );
        `;
    }
}

module.exports = Notification;