const Notification = require('../models/Notification');

const handleNotifications = async (req, res) => { // Added async
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    
    if (method === 'GET') {
        const userId = parsedUrl.searchParams.get('user_id');
        if (userId) {
            const notifications = await Notification.findByUserId(parseInt(userId)); // Added await
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(notifications));
        } else {
            res.statusCode = 400;
            res.end('User ID is required');
        }
    } else if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => { // Made callback async
            const { user_id, message } = JSON.parse(body);
            if (user_id && message) {
                const notification = new Notification(parseInt(user_id), message);
                await notification.save(); // Added await
                res.statusCode = 201;
                res.end('Notification created');
            } else {
                res.statusCode = 400;
                res.end('Invalid notification data');
            }
        });
    } else if (method === 'PATCH') {
        const listingId = parsedUrl.searchParams.get('notification_id');
        if (listingId) {
            const updatedNotification = await Notification.markAsRead(parseInt(listingId)); // Added await
            if (updatedNotification) {
                res.statusCode = 200;
                res.end('Notification marked as read');
            } else {
                res.statusCode = 404;
                res.end('Notification not found');
            }
        } else {
            res.statusCode = 400;
            res.end('Notification ID is required');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
};

module.exports = handleNotifications;