const Review = require('../models/Review');

const handleReviews = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    const photoIdMatch = parsedUrl.pathname.match(/\/reviews\/?(\d+)?/);
    
    if (method === 'GET') {
        const photoId = parsedUrl.searchParams.get('photo_id');
        if (photoId) {
            const reviews = Review.findByPhotoId(parseInt(photoId));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(reviews));
        } else {
            res.statusCode = 400;
            res.end('Photo ID is required');
        }
    } else if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { user_id, photo_id, rating, review_text } = JSON.parse(body);
            if (user_id && photo_id && rating) {
                const review = new Review(parseInt(user_id), parseInt(photo_id), parseInt(rating), review_text);
                review.save();
                res.statusCode = 201;
                res.end('Review created');
            } else {
                res.statusCode = 400;
                res.end('Invalid review data');
            }
        });
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
};

module.exports = handleReviews;