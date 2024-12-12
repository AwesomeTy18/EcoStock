const utils = require('../utils.js');
const { authenticateToken } = require('../utils.js');
const User = require('../models/User'); // Add import for User model

const handlePhotographers = async (req, res, parsedUrl) => {
    const method = req.method.toUpperCase();

    if (method === 'GET') {
        authenticateToken(req, res, async () => {
            const roles = req.user.roles.split(',');
            if (roles.includes('photographer')) {
                utils.sendJsonResponse(res, 200, { message: 'Valid' });
            } else if (await User.exists({ user_id: req.user.user_id, photographer_applicant: 1 })) {
                utils.sendJsonResponse(res, 200, { message: 'Pending' });
            } else {
                utils.sendJsonResponse(res, 403, { message: 'Access Denied' });
            }
        });
    }
    else if (method === 'POST') {
        authenticateToken(req, res, async () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const { full_name, about_me, portfolio_url } = JSON.parse(body);

                    // Validate input
                    if (!full_name || !about_me || !portfolio_url) {
                        utils.sendJsonResponse(res, 400, { success: false, message: 'All fields are required.' });
                        return;
                    }

                    // Update user with photographer information
                    await User.updateOne(
                        { user_id: req.user.user_id },
                        {
                            photographer_applicant: true,
                            photographer_full_name: full_name,
                            photographer_about_me: about_me,
                            photographer_portfolio_url: portfolio_url,
                        }
                    );

                    utils.sendJsonResponse(res, 201, { success: true, message: 'Photographer profile updated successfully.' });
                } catch (error) {
                    utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid JSON format.' });
                }
            });
        });
    }
    else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed.' });
    }
};

module.exports = handlePhotographers;