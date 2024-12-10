const fs = require('fs');
const path = require('path');

class Review {
    constructor(user_id, photo_id, rating, review_text = '') {
        this.review_id = Date.now();
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.rating = rating;
        this.review_text = review_text;
        this.created_at = new Date().toISOString();
    }

    save() {
        const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8'));
        reviews.push(this);
        fs.writeFileSync(path.join(__dirname, 'reviews.json'), JSON.stringify(reviews, null, 2));
    }

    static findByPhotoId(photo_id) {
        const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8'));
        return reviews.filter(review => review.photo_id === photo_id);
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