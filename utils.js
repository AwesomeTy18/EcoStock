const bcrypt = require('bcrypt');
const crypto = require('crypto');

const utils = {};

/**
 * Sends a JSON response with the given status code and data.
 * @param {http.ServerResponse} res 
 * @param {number} statusCode 
 * @param {object} data 
 */
function sendJsonResponse(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

const JWT_SECRET = 'your_secret_key'; // Use a secure key in production

// Helper functions for JWT handling
function generateToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
    if (signature !== expectedSignature) {
        throw new Error('Invalid token');
    }
    return JSON.parse(Buffer.from(body, 'base64url').toString());
}

// Helper functions for cookie handling
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        const value = rest.join('=');
        cookies[name] = value;
    });
    return cookies;
}

function serializeCookie(name, value, options = {}) {
    let cookieStr = `${name}=${value}`;
    if (options.httpOnly) cookieStr += '; HttpOnly';
    if (options.secure) cookieStr += '; Secure';
    if (options.maxAge !== undefined) cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.path) cookieStr += `; Path=${options.path}`;
    return cookieStr;
}

/**
 * Middleware to verify JWT from cookies
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {Function} next 
 */
function authenticateToken(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token;
    if (!token) {
        sendJsonResponse(res, 401, { success: false, message: 'Unauthorized' });
        return;
    }
    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        sendJsonResponse(res, 403, { success: false, message: 'Forbidden' });
    }
}

module.exports = {
    sendJsonResponse,
    generateToken,
    serializeCookie,
    authenticateToken,
};