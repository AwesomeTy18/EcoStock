const db = require('../db.js');

class Photo {
    constructor(photo_id, photographer_id, price, title, description, location, date_taken, watermark_url, high_res_url, created_at) {
        this.photo_id = photo_id;
        this.photographer_id = photographer_id;
        this.price = price;
        this.title = title;
        this.description = description;
        this.location = location;
        this.date_taken = date_taken;
        this.watermark_url = watermark_url;
        this.high_res_url = high_res_url;
        this.created_at = created_at;
    }

    async save() {
        const sql = `INSERT INTO photos (photo_id, photographer_id, price, title, description, location, date_taken, watermark_url, high_res_url, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [
                    this.photo_id, this.photographer_id, this.price, this.title, this.description,
                    this.location, this.date_taken, this.watermark_url, this.high_res_url, new Date().toISOString()
                ], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Finds a photo by its ID.
     * @param {number} id 
     * @returns {Photo|null}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM photos WHERE photo_id = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            return row ? new Photo(
                row.photo_id, row.photographer_id, row.price, row.title, row.description,
                row.location, row.date_taken, row.watermark_url, row.high_res_url, row.created_at
            ) : null;
        } catch (err) {
            throw err;
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM photos';
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                const photos = rows.map(row => new Photo(
                    row.photo_id, row.photographer_id, row.price, row.title, row.description,
                    row.location, row.date_taken, row.watermark_url, row.high_res_url, row.created_at
                ));
                resolve(photos);
            });
        });
    }

    static async create(id, title, description, price, watermark_url, high_res_url, photographer_id) {
        const newPhoto = new Photo(
            id, photographer_id, price, title, description, 'Unknown',
            new Date().toISOString(), watermark_url, high_res_url, new Date().toISOString()
        );
        return await newPhoto.save();
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM photos;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="photos";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const samplePhotos = [
                {
                    photo_id: 101,
                    photographer_id: 1,
                    title: 'Sunset Over Mountains',
                    description: 'A beautiful sunset over the rocky mountains.',
                    price: 29.99,
                    location: 'Rocky Mountains',
                    date_taken: '2023-08-15',
                    watermark_url: '/photos/watermark101.jpg',
                    high_res_url: '/photos/highres101.jpg',
                    created_at: new Date().toISOString(),
                },
                {
                    photo_id: 102,
                    photographer_id: 2,
                    title: 'Calm Lake',
                    description: 'A serene lake surrounded by trees.',
                    price: 19.99,
                    location: 'Deep Forest',
                    date_taken: '2023-08-20',
                    watermark_url: '/photos/watermark102.jpg',
                    high_res_url: '/photos/highres102.jpg',
                    created_at: new Date().toISOString(),
                },
                {
                    photo_id: 103,
                    photographer_id: 3,
                    title: 'Desert Dunes',
                    description: 'Expansive sand dunes under a clear blue sky.',
                    price: 39.99,
                    location: 'Sahara Desert',
                    date_taken: '2023-06-20',
                    watermark_url: '/photos/watermark103.jpg',
                    high_res_url: '/photos/highres103.jpg',
                    created_at: new Date().toISOString(),
                },
                {
                    photo_id: 104,
                    photographer_id: 4,
                    title: 'Ocean Waves',
                    description: 'Powerful waves crashing onto the shore.',
                    price: 24.99,
                    location: 'Pacific Ocean',
                    date_taken: '2023-05-18',
                    watermark_url: '/photos/watermark104.jpg',
                    high_res_url: '/photos/highres104.jpg',
                    created_at: new Date().toISOString(),
                },
                {
                    photo_id: 105,
                    photographer_id: 5,
                    title: 'Autumn Leaves',
                    description: 'Colorful autumn leaves falling from the trees.',
                    price: 34.99,
                    location: 'New England',
                    date_taken: '2023-10-05',
                    watermark_url: '/photos/watermark105.jpg',
                    high_res_url: '/photos/highres105.jpg',
                    created_at: new Date().toISOString(),
                },
            ];

            for (const photoData of samplePhotos) {
                const newPhoto = new Photo(
                    photoData.photo_id, photoData.photographer_id, photoData.price, photoData.title, photoData.description,
                    photoData.location, photoData.date_taken, photoData.watermark_url, photoData.high_res_url, photoData.created_at
                );
                await newPhoto.save();
            }
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS photos (
                photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
                photographer_id INTEGER,
                price REAL,
                title TEXT,
                description TEXT,
                location TEXT,
                date_taken TEXT,
                watermark_url TEXT,
                high_res_url TEXT,
                created_at TEXT,
                pending_approval BOOLEAN DEFAULT 1
            );
        `;
    }

    static async findPending() {
        const sql = `
            SELECT photos.*, users.name AS photographer_name
            FROM photos
            JOIN users ON photos.photographer_id = users.user_id
            WHERE photos.pending_approval = 1
        `;
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => {
                const photo = new Photo(
                    row.photo_id,
                    row.photographer_id,
                    row.price,
                    row.title,
                    row.description,
                    row.location,
                    row.date_taken,
                    row.watermark_url,
                    row.high_res_url,
                    row.created_at
                );
                photo.photographer_name = row.photographer_name;
                return photo;
            });
        } catch (err) {
            throw err;
        }
    }

    static async approvePhoto(photo_id) {
        const sql = 'UPDATE photos SET pending_approval = 0 WHERE photo_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [photo_id], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static async denyPhoto(photo_id) {
        const sql = 'DELETE FROM photos WHERE photo_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [photo_id], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static async findByPhotographerId(photographer_id) {
        const sql = 'SELECT * FROM photos WHERE photographer_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [photographer_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new Photo(
                row.photo_id,
                row.photographer_id,
                row.price,
                row.title,
                row.description,
                row.location,
                row.date_taken,
                row.watermark_url,
                row.high_res_url,
                row.created_at,
                row.pending_approval
            ));
        } catch (err) {
            throw err;
        }
    }

    // Add other necessary methods as needed
}

module.exports = Photo;