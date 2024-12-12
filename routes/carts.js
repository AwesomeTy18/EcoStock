const Cart = require('../models/Cart');
const Photo = require('../models/Photo');
const utils = require('../utils.js');

// Updated import for authentication middleware
const { authenticateToken } = require('../utils.js');

const handleCarts = async (req, res, parsedUrl) => { // Added async
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (method === 'GET') {
        authenticateToken(req, res, async () => { // Added await and async
            const cart = await Cart.findByUserId(req.user.user_id); // Added await
            if (cart) {
                const enhancedCart = {
                    user_id: cart.user_id,
                    cart_id: cart.cart_id,
                    items: cart.items,
                    added_at: cart.added_at
                };
                utils.sendJsonResponse(res, 200, enhancedCart);
            } else {
                utils.sendJsonResponse(res, 404, { success: false, message: 'Cart not found' });
            }
        });
    }
    else if (method === 'POST') {
        authenticateToken(req, res, async () => { // Added await and async
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => { // Made callback async
                try {
                    const { photo_id, quantity } = JSON.parse(body);

                    // Validate data types
                    if (typeof photo_id !== 'number' || typeof quantity !== 'number') {
                        utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid data types for cart item.' });
                        return;
                    }

                    const photo = await Photo.findById(photo_id); // Added await
                    if (photo) {
                        let cart = await Cart.findByUserId(req.user.user_id); // Added await
                        if (!cart) {
                            await Cart.create(req.user.user_id);
                            cart = await Cart.findByUserId(req.user.user_id); // Added await
                        }
                        await cart.addItem(photo_id, quantity || 1); // Added await
                        await cart.save(); // Ensure cart is saved after modification

                        utils.sendJsonResponse(res, 201, { success: true, message: 'Item added to cart' });
                    } else {
                        utils.sendJsonResponse(res, 404, { success: false, message: 'Photo not found' });
                    }
                } catch (error) {
                    utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid JSON format' });
                }
            });
        });
    }
    else if (method === 'DELETE') {
        authenticateToken(req, res, async () => { // Added await and async
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            const photoId = parseInt(parsedUrl.searchParams.get('photo_id'), 10);
            if (photoId) {
                const cart = await Cart.findByUserId(req.user.user_id); // Added await
                if (cart) {
                    await cart.removeItem(photoId); // Added await
                    await cart.save(); // Ensure cart is saved after modification
                    utils.sendJsonResponse(res, 200, { success: true, message: 'Item removed from cart' });
                } else {
                    utils.sendJsonResponse(res, 404, { success: false, message: 'Cart not found' });
                }
            } else {
                utils.sendJsonResponse(res, 400, { success: false, message: 'Photo ID is required' });
            }
        });
    }
    else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

module.exports = handleCarts;