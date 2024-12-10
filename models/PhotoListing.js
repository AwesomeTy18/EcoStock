const db = require('../db.js');

class PhotoListing {
    constructor(listing_id, photo_id, price, status = 'Available', created_at = new Date()) {
        this.listing_id = listing_id;
        this.photo_id = photo_id;
        this.price = price;
        this.status = status;
        this.created_at = created_at;
    }

    async save() {
        const sql = 'INSERT INTO photo_listings (photo_id, price, status, created_at) VALUES (?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.photo_id, this.price, this.status, new Date().toISOString()], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    static async findByPhotoId(photo_id) {
        const sql = 'SELECT * FROM photo_listings WHERE photo_id = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [photo_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            return row ? new PhotoListing(row.listing_id, row.photo_id, row.price, row.status, row.created_at) : null;
        } catch (err) {
            throw err;
        }
    }

    static async updateStatus(listing_id, newStatus) {
        const sql = 'UPDATE photo_listings SET status = ? WHERE listing_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [newStatus, listing_id], (err) => {
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
            CREATE TABLE IF NOT EXISTS photo_listings (
                listing_id INTEGER PRIMARY KEY AUTOINCREMENT,
                photo_id INTEGER,
                price REAL,
                status TEXT,
                created_at TEXT
            );
        `;
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM photo_listings;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="photo_listings";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const sampleListings = [
                {
                    listing_id: 701,
                    photo_id: 101,
                    price: 100.00,
                    status: 'Available',
                    created_at: '2023-08-16T08:00:00Z',
                },
                {
                    listing_id: 702,
                    photo_id: 102,
                    price: 200.00,
                    status: 'Available',
                    created_at: '2023-07-11T09:30:00Z',
                },
                {
                    listing_id: 703,
                    photo_id: 103,
                    price: 150.00,
                    status: 'Unavailable',
                    created_at: '2023-06-21T10:15:00Z',
                },
                {
                    listing_id: 704,
                    photo_id: 104,
                    price: 75.00,
                    status: 'Available',
                    created_at: '2023-05-19T11:45:00Z',
                },
                {
                    listing_id: 705,
                    photo_id: 105,
                    price: 125.00,
                    status: 'Available',
                    created_at: '2023-10-06T12:00:00Z',
                },
            ];

            for (const listingData of sampleListings) {
                const listing = new PhotoListing(
                    listingData.listing_id, listingData.photo_id, listingData.price,
                    listingData.status, listingData.created_at
                );
                await listing.save();
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PhotoListing;