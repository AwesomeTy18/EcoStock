const fs = require('fs');
const path = require('path');
const utils = require('../utils.js');
const { authenticateToken } = require('../utils.js');
const Photo = require('../models/Photo');
const processImages = require('../scripts/processImages');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.roles.includes('admin')) {
        next();
    } else {
        utils.sendJsonResponse(res, 403, { success: false, message: 'Access denied.' });
    }
};

// Handle admin routes manually
const handleAdmin = async (req, res, parsedUrl) => { // Added async
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (pathname === '/api/admin/upload' && method === 'POST') {
        await authenticateToken(req, res, async () => { // Added await and async
            await checkAdmin(req, res, async () => { // Added await and async
                let data = [];
                req.on('data', chunk => {
                    data.push(chunk);
                });

                req.on('end', async () => { // Made callback async
                    const buffer = Buffer.concat(data);
                    const contentType = req.headers['content-type'] || '';
                    const boundary = contentType.split('boundary=')[1];

                    if (!boundary) {
                        utils.sendJsonResponse(res, 400, { success: false, message: 'No boundary found.' });
                        return;
                    }

                    const parts = bufferSplit(buffer, Buffer.from(`--${boundary}`));
                    const randId = Math.floor(1000000000 + Math.random() * 9000000000);
                    let fields = {};
                    let fileData = null;
                    let filename = '';

                    for (const part of parts) { // Changed to for...of for async compatibility
                        if (part.length === 0 || part.equals(Buffer.from('--\r\n'))) continue;

                        const [header, body] = splitBuffer(part, Buffer.from('\r\n\r\n'));
                        const headers = parseHeaders(header.toString());

                        if (headers['content-disposition']) {
                            const disposition = headers['content-disposition'];
                            const nameMatch = disposition.match(/name="(.+?)"/);
                            const filenameMatch = disposition.match(/filename="(.+?)"/);

                            const fieldName = nameMatch ? nameMatch[1] : null;
                            const fileName = filenameMatch ? filenameMatch[1] : null;

                            if (fileName) {
                                highresname = `highres${randId}${path.extname(fileName)}`;
                                watermarkname = `watermark${randId}.jpg`;
                                const filePath = path.join(__dirname, '../public/photos', highresname);
                                const fileBuffer = body.slice(0, -2); // Remove trailing CRLF
                                fs.writeFileSync(filePath, fileBuffer);
                                fileData = fileBuffer;
                            } else if (fieldName) {
                                const value = body.slice(0, -2).toString(); // Remove trailing CRLF
                                fields[fieldName] = isNaN(value) ? value : Number(value);
                            }
                        }
                    }

                    const { title, description, price } = fields;

                    // Validate data types
                    if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || !fileData) {
                        utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid data format.' });
                        return;
                    }

                    const newPhoto = {
                        photo_id: randId,
                        photographer_id: req.user.user_id,
                        title,
                        description,
                        price,
                        watermark_url: `/photos/${watermarkname}`,
                        high_res_url: `/photos/${highresname}`,
                        created_at: new Date().toISOString()
                    };

                    await Photo.create(newPhoto.photo_id, newPhoto.title, newPhoto.description, newPhoto.price, newPhoto.watermark_url, newPhoto.high_res_url, newPhoto.photographer_id); // Added await
                    
                    // Run processImages
                    await processImages(); // Added await

                    utils.sendJsonResponse(res, 201, { success: true, message: 'Image uploaded and processed.' });
                });

                req.on('error', async (err) => { // Made callback async
                    console.log(err);
                    await utils.sendJsonResponse(res, 500, { success: false, message: 'Server error.' }); // Added await
                });
            });
        });
    } else if (pathname === '/api/admin/pending-images' && method === 'GET') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                try {
                    const pendingImages = await Photo.findPending();
                    utils.sendJsonResponse(res, 200, pendingImages);
                } catch (error) {
                    utils.sendJsonResponse(res, 500, { success: false, message: 'Error fetching pending images.' });
                }
            });
        });
    } else if (pathname === '/api/admin/approve-image' && method === 'POST') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { photo_id } = JSON.parse(body);
                    try {
                        await Photo.approvePhoto(photo_id);
                        utils.sendJsonResponse(res, 200, { success: true, message: 'Photo approved.' });
                    } catch (error) {
                        utils.sendJsonResponse(res, 500, { success: false, message: 'Error approving photo.' });
                    }
                });
            });
        });
    } else if (pathname === '/api/admin/deny-image' && method === 'POST') {
        await authenticateToken(req, res, async () => {
            checkAdmin(req, res, async () => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { photo_id } = JSON.parse(body);
                    try {
                        await Photo.denyPhoto(photo_id);
                        utils.sendJsonResponse(res, 200, { success: true, message: 'Photo denied.' });
                    } catch (error) {
                        utils.sendJsonResponse(res, 500, { success: false, message: 'Error denying photo.' });
                    }
                });
            });
        });
    } else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
    }
};

function splitBuffer(buffer, separator) {
    const index = buffer.indexOf(separator);
    if (index === -1) return [buffer, Buffer.alloc(0)];
    return [
        buffer.slice(0, index),
        buffer.slice(index + separator.length)
    ];
}

function parseHeaders(headerString) {
    const headers = {};
    const lines = headerString.split('\r\n');
    lines.forEach(line => {
        const [key, value] = line.split(': ');
        headers[key.toLowerCase()] = value;
    });
    return headers;
}

const bufferSplit = (buffer, separator) => {
    const parts = [];
    let start = 0;
    let index;
    while ((index = buffer.indexOf(separator, start)) !== -1) {
        parts.push(buffer.slice(start, index));
        start = index + separator.length;
    }
    if (start < buffer.length) {
        parts.push(buffer.slice(start));
    }
    return parts;
};

module.exports = handleAdmin;