const db = require('../db.js');

class Payout {
    constructor(payout_id, photographer_id, amount, payout_date, status) {
        this.payout_id = payout_id;
        this.photographer_id = photographer_id;
        this.amount = amount;
        this.payout_date = payout_date;
        this.status = status;
    }

    async save() {
        const sql = 'INSERT INTO payouts (photographer_id, amount, payout_date, status) VALUES (?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.photographer_id, this.amount, new Date().toISOString(), this.status], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    static async findByPhotographerId(photographer_id) {
        const sql = 'SELECT * FROM payouts WHERE photographer_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [photographer_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new Payout(row.payout_id, row.photographer_id, row.amount, row.payout_date, row.status));
        } catch (err) {
            throw err;
        }
    }

    static async updateStatus(payout_id, newStatus) {
        const sql = 'UPDATE payouts SET status = ? WHERE payout_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [newStatus, payout_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS payouts (
                payout_id INTEGER PRIMARY KEY AUTOINCREMENT,
                photographer_id INTEGER,
                amount REAL,
                payout_date TEXT,
                status TEXT
            );
        `;
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM payouts;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="payouts";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const samplePayouts = [
                {
                    payout_id: 401,
                    photographer_id: 1,
                    amount: 850.00,
                    payout_date: '2023-09-15T09:00:00Z',
                    status: 'Completed',
                },
                {
                    payout_id: 402,
                    photographer_id: 2,
                    amount: 425.00,
                    payout_date: '2023-09-15T09:00:00Z',
                    status: 'Pending',
                },
            ];

            for (const payoutData of samplePayouts) {
                const payout = new Payout(
                    payoutData.payout_id, payoutData.photographer_id, payoutData.amount,
                    payoutData.payout_date, payoutData.status
                );
                await payout.save();
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Payout;