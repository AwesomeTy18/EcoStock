const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');
const Photo = require('../models/Photo');
const sgMail = require('@sendgrid/mail')
const { authenticateToken } = require('../utils.js');
const paypal = require('paypal-rest-sdk')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const handleCreatePayment = async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    if (method === 'POST') {
        await authenticateToken(req, res, async () => { // Added authentication
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                const cart = await Cart.findByUserId(req.user.user_id); // Fetch user's cart
                if (cart && cart.items.length > 0) { // Check if cart is not empty
                    // Calculate total price
                    let total = 0;
                    for (const item of cart.items) {
                        const photo = await Photo.findById(item.photo_id);
                        total += photo.price * item.quantity;
                    }

                    // Retrieve the originating URL from the Referer header
                    const originatingUrl = req.headers.referer || 'http://localhost:3000/cart'; // Fallback URL

                    const paymentData = {
                        intent: 'sale',
                        payer: {
                            payment_method: 'paypal'
                        },
                        redirect_urls: {
                            return_url: originatingUrl, // Use dynamic return URL
                            cancel_url: originatingUrl  // Use dynamic cancel URL
                        },
                        transactions: [{
                            amount: {
                                total: total.toFixed(2), // Use calculated total
                                currency: 'USD'
                            },
                            description: 'Purchase of items from cart'
                        }]
                    };
                    paypal.payment.create(paymentData, (error, payment) => {
                        if (error) {
                            console.log(error)
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('500 Internal Server Error');
                        } else {
                            // Redirect the user to the approval URL
                            const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ approvalUrl }));
                        }
                    });
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Cart is empty' }));
                }
            });
        });
    }
};

const handleExecutePayment = async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    if (method === 'POST') {
        await authenticateToken(req, res, async () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                const { paymentId, payerId } = JSON.parse(body);
                const cart = await Cart.findByUserId(req.user.user_id);
                paypal.payment.execute(paymentId, {payer_id: payerId}, async (error, payment) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Internal Server Error');
                    } else {
                        // res.writeHead(200, { 'Content-Type': 'application/json' });
                        // res.end(JSON.stringify({success: true}));
                        for (const item of cart.items) {
                            const photo = await Photo.findById(item.photo_id);
                            const receiptUrl = `receipts/${Date.now()}.json`

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
                        cart.items = []
                        await cart.save()
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'Purchase completed successfully' }));
                    }
                });
            });
        });
    }
}

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
                    const paymentSuccess = false;

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

module.exports = {handlePurchases, handleCreatePayment, handleExecutePayment}