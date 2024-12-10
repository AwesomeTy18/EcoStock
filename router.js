const handleCarts = require('./routes/carts');
const handleUsers = require('./routes/users');
const handlePhotos = require('./routes/photos');
const handleReviews = require('./routes/reviews');
const handlePurchases = require('./routes/purchases');
const handleAdmin = require('./routes/admin'); // Import admin handler
const User = require('./models/User');
// Import other route handlers as needed

const handleUserRoutes = (req, res, parsedUrl) => {
    if (parsedUrl.pathname === '/api/users/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name, email, password } = JSON.parse(body);
            const existingUser = User.findByEmail(email);
            if (existingUser) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Email already registered.' }));
            } else {
                User.create(name, email, password);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'User registered successfully.' }));
            }
        });
    } else {
        handleUsers(req, res, parsedUrl);
    }
};

const router = (req, res, parsedUrl) => {
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (pathname.startsWith('/api/carts')) {
        handleCarts(req, res, parsedUrl);
    }
    else if (pathname.startsWith('/api/users')) {
        handleUserRoutes(req, res, parsedUrl);
    }
    else if (pathname.startsWith('/api/photos')) {
        handlePhotos(req, res, parsedUrl);
    }
    else if (pathname.startsWith('/api/reviews')) {
        handleReviews(req, res, parsedUrl);
    }
    else if (pathname.startsWith('/api/purchases')) {
        handlePurchases(req, res, parsedUrl);
    }
    else if (pathname.startsWith('/api/admin')) {
        handleAdmin(req, res, parsedUrl);
    }
    // Add other API routes here
    else {
        // Handle 404 for unknown API routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'API Route Not Found' }));
    }
};

module.exports = router;