const handleCarts = require('./routes/carts');
const handleUsers = require('./routes/users');
const handlePhotos = require('./routes/photos');
const handleReviews = require('./routes/reviews');
const { handlePurchases, handleCreatePayment, handleExecutePayment } = require('./routes/purchases');
const handleAdmin = require('./routes/admin'); // Import admin handler
const User = require('./models/User');
// Import other route handlers as needed

const handleUserRoutes = async (req, res, parsedUrl) => {
    try {
        if (parsedUrl.pathname === '/api/users/register' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) {
                body += chunk.toString();
            }
            const { name, email, password } = JSON.parse(body);
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Email already registered.' }));
            } else {
                await User.create(name, email, password);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'User registered successfully.' }));
            }
        } else {
            await handleUsers(req, res, parsedUrl);
        }
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
    }
};

const router = async (req, res, parsedUrl) => {
    try {
        const pathname = parsedUrl.pathname;
        const method = req.method.toUpperCase();

        if (pathname.startsWith('/api/carts')) {
            await handleCarts(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/users')) {
            await handleUserRoutes(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/photos')) {
            await handlePhotos(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/reviews')) {
            await handleReviews(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/purchases')) {
            await handlePurchases(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/admin')) {
            await handleAdmin(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/createpayment')) {
            await handleCreatePayment(req, res, parsedUrl);
        }
        else if (pathname.startsWith('/api/executepayment')) {
            await handleExecutePayment(req, res, parsedUrl);
        }
        // Add other API routes here
        else {
            // Handle 404 for unknown API routes
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'API Route Not Found' }));
        }
    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
    }
};

module.exports = router;