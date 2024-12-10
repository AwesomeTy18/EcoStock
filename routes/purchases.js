const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');
const Photo = require('../models/Photo');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../utils.js');

const handlePurchases = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (method === 'POST') {
        authenticateToken(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { payment_details, promo_code } = JSON.parse(body);
                const cart = Cart.findByUserId(req.user.user_id);
                if (cart && cart.items.length > 0) {
                    const paymentSuccess = true;

                    if (paymentSuccess) {
                        cart.items.forEach(item => {
                            const photo = Photo.findById(item.photo_id);
                            const receiptUrl = `receipts/${Date.now()}.json`;

                            const purchase = new Purchase(req.user.user_id, item.photo_id, receiptUrl);
                            purchase.save();

                            const notificationMessage = `Purchase successful for photo "${photo.title}"`;

                            const notification = new Notification(req.user.user_id, notificationMessage);
                            notification.save();
                        });
                        cart.items = [];
                        cart.save();

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'Purchase completed successfully' }));
                    } else {
                        res.statusCode = 402;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: false, message: 'Payment failed' }));
                    }
                } else {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, message: 'Cart is empty' }));
                }
            });
        });
    } else if (method === 'GET') {
        authenticateToken(req, res, () => {
            const purchases = Purchase.findByUserId(req.user.user_id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(purchases));
        });
    } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    }
};

module.exports = handlePurchases;