const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');
const Photo = require('../models/Photo');
const sgMail = require('@sendgrid/mail')
const { authenticateToken } = require('../utils.js');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const handlePurchases = async (req, res) => { // Added async
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (method === 'POST') {
        await authenticateToken(req, res, async () => { // Added await and async
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                const { payment_details, promo_code } = JSON.parse(body);
                const cart = await Cart.findByUserId(req.user.user_id); // Added await
                if (cart && cart.items.length > 0) {
                    const paymentSuccess = true;

                    if (paymentSuccess) {
                        for (const item of cart.items) { // Changed to for...of for await
                            const photo = await Photo.findById(item.photo_id); // Added await
                            const receiptUrl = `receipts/${Date.now()}.json`;

                            const purchase = new Purchase(null, req.user.user_id, item.photo_id, receiptUrl, new Date());
                            await purchase.save(); // Added await

                            const notificationMsg = {
                                to : req.user.email,
                                from : process.env.SENDGRID_EMAIL,
                                subject : 'Purchase Confirmation',
                                text : `You have successfully purchased the photo ${photo.title}.`,
                                html : `<strong>You have successfully purchased the photo ${photo.title}.</strong>`,
                            }

                            sgMail.send(notificationMsg).then(() => {
                                console.log('Email sent');
                            }).catch((error) => {
                                console.error('Error sending email:', error);
                            });
                        }
                        cart.items = [];
                        await cart.save(); // Added await

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
        await authenticateToken(req, res, async () => { // Added await and async
            const purchases = await Purchase.findByUserId(req.user.user_id); // Added await
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