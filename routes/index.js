const handleUsers = require('./users');
const handlePhotos = require('./photos');
const handleCarts = require('./carts');
const {handlePurchases, handleCreatePayment, handleExecutePayment} = require('./purchases');
const handleReviews = require('./reviews');
const handleAdmin = require('./admin'); // Added handleAdmin
const handleCreatePayment = require('./purchases');

const router = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/users')) {
        handleUsers(req, res, parsedUrl); // Updated to pass parsedUrl
    } else if (pathname.startsWith('/photos')) {
        handlePhotos(req, res, parsedUrl); // Updated to pass parsedUrl
    } else if (pathname.startsWith('/carts')) {
        handleCarts(req, res, parsedUrl); // Updated to pass parsedUrl
    } else if (pathname.startsWith('/purchases')) {
        handlePurchases(req, res);
    } else if (pathname.startsWith('/reviews')) {
        handleReviews(req, res);
    } else if (pathname.startsWith('/admin')) { // Added admin route
        handleAdmin(req, res, parsedUrl); // Updated to pass parsedUrl
    } else if (pathname.startsWith('/createpayment')) {
        handleCreatePayment(req, res, parsedUrl);
    } else if (pathname.startsWith('/executepayment')) {
        handleExecutePayment(req, res, parsedUrl);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
};

module.exports = router;