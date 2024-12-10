const Review = require('../models/Review');
const { authenticateToken } = require('../utils.js');

const handleReviews = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    const photoIdMatch = parsedUrl.pathname.match(/\/reviews\/?(\d+)?/);
    
    if (method === 'GET' && parsedUrl.pathname === '/api/reviews/user') {
        authenticateToken(req, res, () => {
            const userId = req.user.user_id;
            const userReviews = Review.findByUserId(userId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(userReviews));
        });
    } else if (method === 'GET') {
        const photoId = parsedUrl.searchParams.get('photo_id');
        if (parsedUrl.pathname === '/api/reviews/average' && photoId) {
            // Calculate and return the average rating for the photo
            const reviews = Review.findByPhotoId(parseInt(photoId));
            const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(avgRating));
        } else if (photoId) {
            // Return all reviews for the photo
            const reviews = Review.findByPhotoId(parseInt(photoId));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(reviews));
        } else {
            res.statusCode = 400;
            res.end('Photo ID is required');
        }
    } else if (method === 'POST') {
        authenticateToken(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { photo_id, rating, review_text } = JSON.parse(body);
                if (photo_id && rating) {
                    const review = new Review(req.user.user_id, parseInt(photo_id), parseInt(rating), review_text);
                    review.save();
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, message: 'Review submitted' }));
                } else {
                    res.statusCode = 400;
                    res.end('Invalid review data');
                }
            });
        });
    } else if (method === 'PUT') {
        authenticateToken(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { review_id, rating, review_text } = JSON.parse(body);
                if (review_id && rating) {
                    const updatedReview = Review.updateReview(
                        parseInt(review_id),
                        req.user.user_id,
                        parseInt(rating),
                        review_text
                    );
                    if (updatedReview) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'Review updated', review: updatedReview }));
                    } else {
                        res.statusCode = 404;
                        res.end('Review not found or unauthorized');
                    }
                } else {
                    res.statusCode = 400;
                    res.end('Invalid review data');
                }
            });
        });
    } else if (method === 'DELETE') {
        authenticateToken(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { review_id } = JSON.parse(body);
                if (review_id) {
                    const deleted = Review.deleteReview(parseInt(review_id), req.user.user_id);
                    if (deleted) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'Review deleted' }));
                    } else {
                        res.statusCode = 404;
                        res.end('Review not found or unauthorized');
                    }
                } else {
                    res.statusCode = 400;
                    res.end('Review ID is required');
                }
            });
        });
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
};

module.exports = handleReviews;