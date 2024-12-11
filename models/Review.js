const db = require('../db.js');
const path = require('path');

class Review {
    constructor(review_id, user_id, photo_id, rating, review_text, created_at, updated_at) {
        this.review_id = review_id;
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.rating = rating;
        this.review_text = review_text;
        this.created_at = created_at || new Date().toISOString();
        this.updated_at = updated_at || null;
    }

    /**
     * Saves the current review instance to the database.
     * @returns {Promise<number>} The ID of the inserted review.
     */
    async save() {
        const sql = `
            INSERT INTO reviews (user_id, photo_id, rating, review_text, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(
                    sql,
                    [this.user_id, this.photo_id, this.rating, this.review_text, this.created_at],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.lastID);
                        }
                    }
                );
            });
            this.review_id = result;
            return result;
        } catch (err) {
            console.error('Error saving review:', err);
            throw err;
        }
    }

    /**
     * Retrieves all reviews associated with a specific photo ID.
     * @param {number} photo_id - The ID of the photo.
     * @returns {Promise<Review[]>} An array of Review instances.
     */
    static async findByPhotoId(photo_id) {
        const sql = `
            SELECT * FROM reviews
            WHERE photo_id = ?
            ORDER BY created_at DESC
        `;
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [photo_id], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows.map(row => new Review(
                row.review_id,
                row.user_id,
                row.photo_id,
                row.rating,
                row.review_text,
                row.created_at,
                row.updated_at
            ));
        } catch (err) {
            console.error('Error fetching reviews by photo ID:', err);
            throw err;
        }
    }

    /**
     * Retrieves all reviews created by a specific user.
     * @param {number} user_id - The ID of the user.
     * @returns {Promise<Review[]>} An array of Review instances.
     */
    static async findByUserId(user_id) {
        const sql = `
            SELECT * FROM reviews
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [user_id], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows.map(row => new Review(
                row.review_id,
                row.user_id,
                row.photo_id,
                row.rating,
                row.review_text,
                row.created_at,
                row.updated_at
            ));
        } catch (err) {
            console.error('Error fetching reviews by user ID:', err);
            throw err;
        }
    }

    /**
     * Updates an existing review.
     * @param {number} review_id - The ID of the review to update.
     * @param {number} user_id - The ID of the user updating the review.
     * @param {number} newRating - The new rating value.
     * @param {string} newReviewText - The new review text.
     * @returns {Promise<Review|null>} The updated Review instance or null if not found.
     */
    static async updateReview(review_id, user_id, newRating, newReviewText) {
        const sql = `
            UPDATE reviews
            SET rating = ?, review_text = ?, updated_at = ?
            WHERE review_id = ? AND user_id = ?
        `;
        try {
            const changes = await new Promise((resolve, reject) => {
                db.run(
                    sql,
                    [newRating, newReviewText, new Date().toISOString(), review_id, user_id],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.changes);
                        }
                    }
                );
            });

            if (changes > 0) {
                // Fetch the updated review
                const updatedReview = await Review.findById(review_id);
                return updatedReview;
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error updating review:', err);
            throw err;
        }
    }

    /**
     * Deletes a review.
     * @param {number} review_id - The ID of the review to delete.
     * @param {number} user_id - The ID of the user deleting the review.
     * @returns {Promise<boolean>} True if deletion was successful, else false.
     */
    static async deleteReview(review_id, user_id) {
        const sql = `
            DELETE FROM reviews
            WHERE review_id = ? AND user_id = ?
        `;
        try {
            const changes = await new Promise((resolve, reject) => {
                db.run(sql, [review_id, user_id], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });
            return changes > 0;
        } catch (err) {
            console.error('Error deleting review:', err);
            throw err;
        }
    }

    /**
     * Retrieves a single review by its ID.
     * @param {number} review_id - The ID of the review.
     * @returns {Promise<Review|null>} The Review instance or null if not found.
     */
    static async findById(review_id) {
        const sql = `
            SELECT * FROM reviews
            WHERE review_id = ?
        `;
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [review_id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
            if (row) {
                return new Review(
                    row.review_id,
                    row.user_id,
                    row.photo_id,
                    row.rating,
                    row.review_text,
                    row.created_at,
                    row.updated_at
                );
            }
            return null;
        } catch (err) {
            console.error('Error fetching review by ID:', err);
            throw err;
        }
    }

    /**
     * Defines the schema for the reviews table.
     * @returns {string} The SQL statement to create the reviews table.
     */
    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS reviews (
                review_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                photo_id INTEGER NOT NULL,
                rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
                review_text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY(photo_id) REFERENCES photos(photo_id) ON DELETE CASCADE
            );
        `;
    }

    /**
     * Seeds the reviews table with sample data.
     * @returns {Promise<void>}
     */
    static async seed() {
        const sampleReviews = [
            {
                user_id: 1,
                photo_id: 101,
                rating: 5,
                review_text: 'Stunning view! Amazing colors.',
                created_at: '2023-09-05T14:20:00Z',
            },
            {
                user_id: 2,
                photo_id: 102,
                rating: 4,
                review_text: 'Very peaceful and calming.',
                created_at: '2023-09-06T16:45:00Z',
            },
            // Add more sample reviews as needed
        ];

        const insertSql = `
            INSERT INTO reviews (user_id, photo_id, rating, review_text, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            for (const reviewData of sampleReviews) {
                await new Promise((resolve, reject) => {
                    db.run(
                        insertSql,
                        [
                            reviewData.user_id,
                            reviewData.photo_id,
                            reviewData.rating,
                            reviewData.review_text,
                            reviewData.created_at,
                        ],
                        function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(this.lastID);
                            }
                        }
                    );
                });
            }
            console.log('Sample reviews seeded successfully.');
        } catch (err) {
            console.error('Error seeding reviews:', err);
            throw err;
        }
    }
}

module.exports = Review;