require('dotenv').config()
const http = require('http');
const fs = require('fs');
const path = require('path');
const router = require('./router');
const Purchase = require('./models/Purchase');
const User = require('./models/User');
const { authenticateToken } = require('./utils.js'); // Import authenticateToken

const PORT = process.env.PORT || 3000;

const handleApiRoutes = async (req, res, parsedUrl) => {
    await router(req, res, parsedUrl);
};

const serveHighResPhoto = (req, res, pathname) => {
    authenticateToken(req, res, async () => {
        const photoIdMatch = pathname.match(/highres(\d+)\.(\S+)/);
        const photoId = photoIdMatch ? parseInt(photoIdMatch[1], 10) : null;

        if (!photoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Photo ID is required' }));
            return;
        }

        if (!req.user || req.user.user_id === undefined) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
            return;
        }

        const purchase = (await Purchase.findByUserId(req.user.user_id)).find(p => p.photo_id === photoId);
        if (!purchase) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Access denied. Photo not purchased.' }));
            return;
        }

        // Serve the high-resolution photo
        const photoPath = path.join(__dirname, 'public', pathname);
        fs.readFile(photoPath, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Photo not found');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
            res.end(data);
        });
    });
};

const serveStaticFile = (res, filePath) => {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, 'public', '404.html'), (err404, content404) => {
                    if (err404) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Internal Server Error');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content404, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.json': 'application/json',
                '.webp': 'image/webp',
                // Add more MIME types as needed
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            const headers = { 'Content-Type': contentType };
            if (contentType.startsWith('image')) {
                headers['Cache-Control'] = 'public, max-age=2592000, immutable';
            }
            res.writeHead(200, headers);
            res.end(content, 'utf-8');
        }
    });
};

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        // Remove ".html" extension from the URL.
        if (pathname.endsWith('.html')) {

            // Unless it's the index.html file.
            if (pathname === '/index.html') {
                res.writeHead(301, {
                    'Location': '/'
                });
                res.end();
                return;
            }

            res.writeHead(301, {
                'Location': pathname.slice(0, -5)
            });
            res.end();
            return;
        }

        if (pathname.startsWith('/api/')) {
            await handleApiRoutes(req, res, parsedUrl);
        } else if (pathname.startsWith('/photos/highres')) {
            await serveHighResPhoto(req, res, pathname);
        } else {
            let filePath = path.join(__dirname, 'public', pathname);
            if (pathname === '/') {
                filePath = path.join(__dirname, 'public', 'index.html');
            }
            else if (pathname.startsWith('/admin/')) {
                filePath = path.join(__dirname, 'public', 'admin', `${pathname.substring(7)}.html`);
            } else if (['/login', '/cart', '/my-pictures', '/details', '/register', '/my-reviews', '/photographers'].includes(pathname)) {
                filePath = path.join(__dirname, 'public', `${pathname.substring(1)}.html`);
            }
            await serveStaticFile(res, filePath);
        }
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});