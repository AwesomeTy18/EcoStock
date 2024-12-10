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
                        // ...existing code to serve photo...
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
    } else {
        console.log('Unhandled method:', method);
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

module.exports = handlePhotos;