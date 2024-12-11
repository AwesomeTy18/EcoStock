const Review = require('../models/Review');
const { authenticateToken } = require('../utils.js');

const handleReviews = async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (method === 'GET' && parsedUrl.pathname === '/api/reviews/user') {
        await authenticateToken(req, res, async () => { // Made callback async
            try {
                const userId = req.user.user_id;
                const userReviews = await Review.findByUserId(userId); // Awaited async function
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(userReviews));
            } catch (error) {
                console.error('Error fetching user reviews:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        });
    } else if (method === 'GET') {
        const photoId = parsedUrl.searchParams.get('photo_id');
        if (parsedUrl.pathname === '/api/reviews/average' && photoId) {
            try {
                // Calculate and return the average rating for the photo
                const reviews = await Review.findByPhotoId(parseInt(photoId)); // Awaited async function
                const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(avgRating));
            } catch (error) {
                console.error('Error calculating average rating:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else if (photoId) {
            try {
                // Return all reviews for the photo
                const reviews = await Review.findByPhotoId(parseInt(photoId)); // Awaited async function
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(reviews));
            } catch (error) {
                console.error('Error fetching reviews for photo:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else {
            res.statusCode = 400;
            res.end('Photo ID is required');
        }
    } else if (method === 'POST') {
        await authenticateToken(req, res, async () => { // Made callback async
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                try {
                    const { photo_id, rating, review_text } = JSON.parse(body);
                    if (photo_id && rating && review_text) { // Ensure review_text is provided
                        // Check if the user has already reviewed this photo
                        const existingReview = await Review.findByUserAndPhoto(req.user.user_id, parseInt(photo_id));
                        if (existingReview) {
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: false, message: 'You have already reviewed this photo.' }));
                            return;
                        }

                        const review = new Review(
                            null, // review_id is auto-incremented
                            req.user.user_id, 
                            parseInt(photo_id), 
                            parseInt(rating), 
                            review_text
                        );
                        await review.save(); // Awaited async function
                        res.statusCode = 201;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'Review submitted' }));
                    } else {
                        res.statusCode = 400;
                        res.end('Invalid review data');
                    }
                } catch (error) {
                    console.error('Error submitting review:', error);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
        });
    } else if (method === 'PUT') {
        await authenticateToken(req, res, async () => { // Made callback async
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                try {
                    const { review_id, rating, review_text } = JSON.parse(body);
                    if (review_id && rating) {
                        const updatedReview = await Review.updateReview( // Awaited async function
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
                } catch (error) {
                    console.error('Error updating review:', error);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
        });
    } else if (method === 'DELETE') {
        await authenticateToken(req, res, async () => { // Made callback async
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                try {
                    const { review_id } = JSON.parse(body);
                    if (review_id) {
                        const deleted = await Review.deleteReview(parseInt(review_id), req.user.user_id); // Awaited async function
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
                } catch (error) {
                    console.error('Error deleting review:', error);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
        });
    } else {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
        res.end('Method Not Allowed');
    }
};

module.exports = handleReviews;