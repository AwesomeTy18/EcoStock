const fs = require('fs');
const path = require('path');

class Review {
    constructor(user_id, photo_id, rating, review_text = '') {
        this.review_id = Date.now();
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.rating = rating;
        this.review_text = review_text;
        this.created_at = new Date();
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
}

module.exports = Review;