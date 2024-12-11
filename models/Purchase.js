const db = require('../db.js');

class Purchase {
    constructor(purchase_id, user_id, photo_id, receipt_url, purchase_date) {
        this.purchase_id = purchase_id;
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.purchase_date = purchase_date || new Date();
        this.receipt_url = receipt_url;
    }

    async save() {
        const sql = 'INSERT INTO purchases (user_id, photo_id, receipt_url, purchase_date) VALUES (?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.user_id, this.photo_id, this.receipt_url, new Date().toISOString()], function(err) {
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
        const sql = 'SELECT * FROM purchases WHERE user_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [user_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new Purchase(row.purchase_id, row.user_id, row.photo_id, row.receipt_url, row.purchase_date));
        } catch (err) {
            throw err;
        }
    }

    static async findByUserAndPhoto(user_id, photo_id) {
        const sql = 'SELECT * FROM purchases WHERE user_id = ? AND photo_id = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [user_id, photo_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            return row ? new Purchase(row.purchase_id, row.user_id, row.photo_id, row.receipt_url, row.purchase_date) : null;
        } catch (err) {
            throw err;
        }
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM purchases;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="purchases";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const samplePurchases = [
                {
                    purchase_id: 301,
                    user_id: 7,
                    photo_id: 101,
                    purchase_date: '2023-09-01T10:00:00Z',
                    receipt_url: 'http://example.com/receipts/301.json',
                },
                {
                    purchase_id: 302,
                    user_id: 8,
                    photo_id: 102,
                    purchase_date: '2023-09-02T11:30:00Z',
                    receipt_url: 'http://example.com/receipts/302.json',
                },
            ];

            for (const purchaseData of samplePurchases) {
                const purchase = new Purchase(
                    purchaseData.purchase_id, purchaseData.user_id, purchaseData.photo_id,
                    purchaseData.receipt_url, purchaseData.purchase_date
                );
                await purchase.save();
            }
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS purchases (
                purchase_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                photo_id INTEGER,
                receipt_url TEXT,
                purchase_date TEXT
            );
        `;
    }
}

module.exports = Purchase;