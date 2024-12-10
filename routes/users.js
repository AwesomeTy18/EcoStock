const User = require('../models/User');
const utils = require('../utils.js');

// Removed imports and definitions of JWT_SECRET, crypto, and helper functions

// Import necessary functions from utils.js
const { generateToken, serializeCookie, authenticateToken } = require('../utils.js');

// ...existing code...

/**
 * Handles user-related API requests.
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {URL} parsedUrl 
 */
const handleUsers = (req, res, parsedUrl) => {
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (method === 'POST') {
        if (pathname === '/api/users/login') {
            // Handle user login
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                console.log('Received login request body:', body); // **Debugging Log**

                try {
                    const { email, password } = JSON.parse(body);
                    console.log('Parsed email:', email); // **Debugging Log**
                    console.log('Parsed password:', password); // **Debugging Log**

                    const user = User.authenticate(email, password);
                    if (user) {
                        const token = generateToken({ user_id: user.user_id, name: user.name, roles: user.roles });
                        res.setHeader('Set-Cookie', serializeCookie('token', token, { httpOnly: false, secure: true, path: '/' }));
                        utils.sendJsonResponse(res, 200, { success: true });
                    } else {
                        utils.sendJsonResponse(res, 401, { success: false, message: 'Invalid credentials' });
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error); // **Debugging Log**
                    utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid request body' });
                }
            });
        } else if (pathname === '/api/users/logout') {
            res.setHeader('Set-Cookie', serializeCookie('token', '', { httpOnly: true, secure: true, maxAge: 0, path: '/' }));
            utils.sendJsonResponse(res, 200, { success: true, message: 'Logged out successfully' });
        }
        // Handle other POST routes
    }
    else if (method === 'GET') {
        if (pathname === '/api/users') {
            authenticateToken(req, res, () => {
                const user = User.findById(req.user.user_id);
                if (user) {
                    utils.sendJsonResponse(res, 200, { user_id: user.user_id, name: user.name, email: user.email });
                } else {
                    utils.sendJsonResponse(res, 404, { success: false, message: 'User not found' });
                }
            });
        } else if (pathname === '/api/users/check-auth') {
            const token = utils.extractToken(req);
            let isAuthenticated = false;

            if (token && utils.verifyToken(token)) {
                isAuthenticated = true;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ isAuthenticated }));
        }
        // Endpoint to get user details by user_id
        else if (method === 'GET' && /^\/api\/users\/\d+$/.test(pathname)) {
            const userId = parseInt(pathname.split('/').pop(), 10);
            const user = User.findById(userId); // Implement findById in User model

            if (user) {
                utils.sendJsonResponse(res, 200, user);
            } else {
                utils.sendJsonResponse(res, 404, { success: false, message: 'User not found' });
            }
        }
        // Handle other GET routes
    }
    // Handle other methods
    else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

module.exports = handleUsers;