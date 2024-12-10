const Payout = require('../models/Payout');

const handlePayouts = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;
    const payoutIdMatch = parsedUrl.pathname.match(/\/payouts\/?(\d+)?/);
    
    if (method === 'GET') {
        const photographerId = parsedUrl.searchParams.get('photographer_id');
        if (photographerId) {
            const payouts = Payout.findByPhotographerId(parseInt(photographerId));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payouts));
        } else {
            res.statusCode = 400;
            res.end('Photographer ID is required');
        }
    } else if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { photographer_id, amount } = JSON.parse(body);
            if (photographer_id && amount) {
                const payout = new Payout(parseInt(photographer_id), parseFloat(amount));
                payout.save();
                res.statusCode = 201;
                res.end('Payout created');
            } else {
                res.statusCode = 400;
                res.end('Invalid payout data');
            }
        });
    } else if (method === 'PATCH') {
        const payoutId = payoutIdMatch ? parseInt(payoutIdMatch[1]) : null;
        if (payoutId) {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { status } = JSON.parse(body);
                if (status) {
                    const updatedPayout = Payout.updateStatus(payoutId, status);
                    if (updatedPayout) {
                        res.statusCode = 200;
                        res.end('Payout status updated');
                    } else {
                        res.statusCode = 404;
                        res.end('Payout not found');
                    }
                } else {
                    res.statusCode = 400;
                    res.end('Status is required');
                }
            });
        } else {
            res.statusCode = 400;
            res.end('Payout ID is required');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
};

module.exports = handlePayouts;