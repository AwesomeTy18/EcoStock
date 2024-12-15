const fs = require('fs');
const path = require('path');
const utils = require('../utils.js');
const { authenticateToken } = require('../utils.js');
const Photo = require('../models/Photo');
const processImages = require('../scripts/processImages');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.roles.includes('admin')) {
        next();
    } else {
        utils.sendJsonResponse(res, 403, { success: false, message: 'Access denied.' });
    }
};

// Handle admin routes manually
const handleAdmin = async (req, res, parsedUrl) => { // Added async
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (pathname === '/api/admin/pending-images' && method === 'GET') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                try {
                    const pendingImages = await Photo.findPending();
                    utils.sendJsonResponse(res, 200, pendingImages);
                } catch (error) {
                    utils.sendJsonResponse(res, 500, { success: false, message: 'Error fetching pending images.' });
                }
            });
        });
    } else if (pathname === '/api/admin/approve-image' && method === 'POST') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { photo_id } = JSON.parse(body);
                    try {
                        await Photo.approvePhoto(photo_id);
                        utils.sendJsonResponse(res, 200, { success: true, message: 'Photo approved.' });
                    } catch (error) {
                        utils.sendJsonResponse(res, 500, { success: false, message: 'Error approving photo.' });
                    }
                });
            });
        });
    } else if (pathname === '/api/admin/deny-image' && method === 'POST') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { photo_id } = JSON.parse(body);
                    try {
                        await Photo.denyPhoto(photo_id);
                        utils.sendJsonResponse(res, 200, { success: true, message: 'Photo denied.' });
                    } catch (error) {
                        utils.sendJsonResponse(res, 500, { success: false, message: 'Error denying photo.' });
                    }
                });
            });
        });
    } else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

module.exports = handleAdmin;