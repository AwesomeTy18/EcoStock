const Photo = require('../models/Photo');
const PhotoListing = require('../models/PhotoListing');
const utils = require('../utils.js');
const { authenticateToken } = require('../utils.js'); // Import authenticateToken
const path = require('path');
const fs = require('fs');

/**
 * Handles requests related to photos.
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {URL} parsedUrl 
 */
const handlePhotos = async (req, res, parsedUrl, session) => { // Added async
    console.log('handlePhotos called');
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (method === 'GET') {
        if (pathname === '/api/photos/details') { // Updated path
            console.log('Handling /api/photos/details');
            const photoId = parseInt(parsedUrl.searchParams.get('photo_id'), 10);
            console.log('Requested photo ID:', photoId);
            if (photoId) {
                const photo = await Photo.findById(photoId); // Added await
                if (photo) {
                    console.log('Photo found:', photo);
                    utils.sendJsonResponse(res, 200, photo);
                } else {
                    console.log('Photo not found');
                    utils.sendJsonResponse(res, 404, { success: false, message: 'Photo not found' });
                }
            } else {
                console.log('Photo ID is missing in the request');
                utils.sendJsonResponse(res, 400, { success: false, message: 'Photo ID is required' });
            }
        } else if (pathname === '/api/photos') { // Updated path
            // Handle /api/photos route
            console.log('Handling /api/photos');
            const searchQuery = parsedUrl.searchParams.get('search') || '';
            let photos = await Photo.findAll(); // Added await
            
            if (searchQuery) {
                const lowerCaseQuery = searchQuery.toLowerCase();
                photos = photos.filter(photo =>
                    photo.title.toLowerCase().includes(lowerCaseQuery) ||
                    photo.description.toLowerCase().includes(lowerCaseQuery) ||
                    photo.location.toLowerCase().includes(lowerCaseQuery)
                );
            }

            // Enhance photos with price from Photo model
            const enhancedPhotos = photos.map(photo => {
                return {
                    ...photo,
                    price: typeof photo.price === 'number' ? photo.price : 'N/A', // Ensure price is a number
                };
            });

            utils.sendJsonResponse(res, 200, enhancedPhotos);
        } else if (pathname === '/photos/highres') {
            await authenticateToken(req, res, async () => { // Added await and async
                const photoId = parseInt(parsedUrl.searchParams.get('photo_id'), 10);
                if (photoId) {
                    const photo = await Photo.findById(photoId); // Added await
                    if (photo) {
                        // Serve the high-resolution photo
                    } else {
                        utils.sendJsonResponse(res, 404, { success: false, message: 'Photo not found' });
                    }
                } else {
                    utils.sendJsonResponse(res, 400, { success: false, message: 'Photo ID is required' });
                }
            });
        } else {
            console.log('Unhandled GET path:', pathname);
            utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
        }
    } else if (method === 'DELETE' && pathname === '/api/photos/admindelete') {
        console.log('Handling DELETE /api/photos/admindelete');
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                try {
                    // Parse the request body to get the photo_id
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', async () => {
                        const { photo_id } = JSON.parse(body);
                        if (!photo_id) {
                            utils.sendJsonResponse(res, 400, { success: false, message: 'photo_id is required' });
                            return;
                        }
        
                        // Attempt to delete the photo
                        try {
                            await Photo.deleteById(photo_id);
                            utils.sendJsonResponse(res, 200, { success: true, message: 'Photo deleted successfully' });
                        } catch (err) {
                            console.error('Error deleting photo:', err);
                            utils.sendJsonResponse(res, 500, { success: false, message: 'Internal server error' });
                        }
                    });
                } catch (err) {
                    console.error('Error handling DELETE /api/photos:', err);
                    utils.sendJsonResponse(res, 500, { success: false, message: 'Internal server error' });
                }
            });
        });
    } else if (method === 'DELETE' && pathname === '/api/photos') {
        console.log('Handling DELETE /api/photos');
        await authenticateToken(req, res, async () => {
            checkPhotographer(req, res, async () => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    const { photo_id } = JSON.parse(body);
                    const photo = await Photo.findById(photo_id);
                    let photographer_id;
                    if (photo) {
                        photographer_id = photo.photographer_id;
                    } else {
                        utils.sendJsonResponse(res, 404, { success: false, message: 'Photo not found or unauthorized' });
                    }
                    const user = req.user;
                    if (user.user_id === photographer_id) {
                        try {
                            if (photo) {
                                await Photo.deleteById(photo_id);
                                utils.sendJsonResponse(res, 200, { success: true, message: 'Photo deleted' });
                            } else {
                                utils.sendJsonResponse(res, 404, { success: false, message: 'Photo not found or unauthorized' });
                            }
                            
                        } catch (error) {
                            console.error('Error deleting photo:', error);
                            utils.sendJsonResponse(res, 500, { success: false, message: 'Internal Server Error' });
                        }
                    }
                });
            });
        });
    } else {
        console.log('Unhandled method:', method);
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.roles.includes('admin')) {
        next();
    } else {
        utils.sendJsonResponse(res, 403, { success: false, message: 'Access denied.' });
    }
};

const checkPhotographer = (req, res, next) => {
    const user = req.user;
    if (user && user.roles.includes('photographer')) {
        next();
    } else {
        utils.sendJsonResponse(res, 403, { success: false, message: 'Access denied.' });
    }
};

module.exports = handlePhotos;