const db = require('../db.js');
const path = require('path');

class Review {
    constructor(review_id, user_id, photo_id, rating, review_text, created_at) {
        this.review_id = review_id;
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.rating = rating;
        this.review_text = review_text;
        this.created_at = created_at || new Date();
    }

    async save() {
        const sql = 'INSERT INTO reviews (user_id, photo_id, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.user_id, this.photo_id, this.rating, this.review_text, new Date().toISOString()], function(err) {
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
        const sql = 'SELECT * FROM reviews WHERE photo_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [photo_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new Review(row.review_id, row.user_id, row.photo_id, row.rating, row.review_text, row.created_at));
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS reviews (
                review_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                photo_id INTEGER,
                rating INTEGER,
                review_text TEXT,
                created_at TEXT
            );
        `;
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM reviews;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="reviews";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const sampleReviews = [
                {
                    review_id: 501,
                    user_id: 7,
                    photo_id: 101,
                    rating: 5,
                    review_text: 'Stunning view! Amazing colors.',
                    created_at: '2023-09-05T14:20:00Z',
                },
                {
                    review_id: 502,
                    user_id: 8,
                    photo_id: 102,
                    rating: 4,
                    review_text: 'Very peaceful and calming.',
                    created_at: '2023-09-06T16:45:00Z',
                },
            ];

            for (const reviewData of sampleReviews) {
                const review = new Review(
                    reviewData.review_id, reviewData.user_id, reviewData.photo_id,
                    reviewData.rating, reviewData.review_text, reviewData.created_at
                );
                await review.save();
            }
        } catch (err) {
            throw err;
        }
    }

    static findByUserId(user_id) {
        const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8'));
        return reviews.filter(review => review.user_id === user_id);
    }

    static updateReview(review_id, user_id, newRating, newReviewText) {
        const reviewsPath = path.join(__dirname, 'reviews.json');
        const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
        const review = reviews.find(r => r.review_id === review_id && r.user_id === user_id);
        if (review) {
            review.rating = newRating;
            review.review_text = newReviewText;
            review.updated_at = new Date().toISOString();
            fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
            return review;
        }
        return null;
    }

    static deleteReview(review_id, user_id) {
        const reviewsPath = path.join(__dirname, 'reviews.json');
        let reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
        const initialLength = reviews.length;
        reviews = reviews.filter(r => !(r.review_id === review_id && r.user_id === user_id));
        if (reviews.length < initialLength) {
            fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
            return true;
        }
        return false;
    }
}

module.exports = Review;