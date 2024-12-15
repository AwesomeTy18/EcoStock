const utils = require('../utils.js');
const { authenticateToken } = require('../utils.js');
const User = require('../models/User'); // Add import for User model
const fs = require('fs'); // Add this import
const path = require('path'); // Add this import
const Photo = require('../models/Photo'); // Add this import
const processImages = require('../scripts/processImages'); // Add this import

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

const handlePhotographers = async (req, res, parsedUrl) => {
    const method = req.method.toUpperCase();
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/photographers/upload' && method === 'POST') {
        authenticateToken(req, res, async () => {
            const user = await User.findById(req.user.user_id);
            const roles = user.roles.split(',');
            if (!roles.includes('photographer')) {
                utils.sendJsonResponse(res, 403, { success: false, message: 'Access Denied' });
                return;
            }

            let data = [];
            req.on('data', chunk => {
                data.push(chunk);
            });

            req.on('end', async () => {
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
                let highresname = '';
                let watermarkname = '';

                for (const part of parts) {
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
                            const fileBuffer = body.slice(0, -2);
                            fs.writeFileSync(filePath, fileBuffer);
                            fileData = fileBuffer;
                        } else if (fieldName) {
                            const value = body.slice(0, -2).toString();
                            fields[fieldName] = isNaN(value) ? value : Number(value);
                        }
                    }
                }

                const { title, description, price, location, date_taken } = fields;
                console.log("fields", fields);
                fields.title = String(fields.title || '');
                fields.description = String(fields.description || '');
                fields.price = Number(fields.price || 0);
                fields.location = String(fields.location || '');
                fields.date_taken = String(fields.date_taken || '');

                if (!fileData) {
                    utils.sendJsonResponse(res, 400, { success: false, message: 'File data is missing.' });
                    return;
                }

                const newPhoto = {
                    photo_id: randId,
                    title,
                    description,
                    price,
                    location,
                    date_taken,
                    watermark_url: `/photos/${watermarkname}`,
                    high_res_url: `/photos/${highresname}`,
                    photographer_id: req.user.user_id,
                    created_at: new Date().toISOString()
                };

                await Photo.create(
                    newPhoto.photo_id,
                    newPhoto.title,
                    newPhoto.description,
                    newPhoto.price,
                    newPhoto.location,
                    newPhoto.date_taken,
                    newPhoto.watermark_url,
                    newPhoto.high_res_url,
                    newPhoto.photographer_id,
                    newPhoto.created_at
                );

                await processImages();

                utils.sendJsonResponse(res, 201, { success: true, message: 'Image uploaded and processed.' });
            });

            req.on('error', (err) => {
                console.log(err);
                utils.sendJsonResponse(res, 500, { success: false, message: 'Server error.' });
            });
        });
    }
    else if (method === 'GET') {
        authenticateToken(req, res, async () => {
            const user = await User.findById(req.user.user_id);
            const roles = user.roles.split(',');
            if (roles.includes('photographer')) {
                utils.sendJsonResponse(res, 200, { message: 'Valid' });
            } else if (await User.exists({ user_id: req.user.user_id, photographer_applicant: 1 })) {
                utils.sendJsonResponse(res, 200, { message: 'Pending' });
            } else {
                utils.sendJsonResponse(res, 403, { message: 'Access Denied' });
            }
        });
    }
    else if (method === 'POST') {
        authenticateToken(req, res, async () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const { full_name, about_me, portfolio_url } = JSON.parse(body);

                    // Validate input
                    if (!full_name || !about_me || !portfolio_url) {
                        utils.sendJsonResponse(res, 400, { success: false, message: 'All fields are required.' });
                        return;
                    }

                    // Update user with photographer information
                    await User.updateOne(
                        { user_id: req.user.user_id },
                        {
                            photographer_applicant: true,
                            photographer_full_name: full_name,
                            photographer_about_me: about_me,
                            photographer_portfolio_url: portfolio_url,
                        }
                    );

                    utils.sendJsonResponse(res, 201, { success: true, message: 'Photographer profile updated successfully.' });
                } catch (error) {
                    utils.sendJsonResponse(res, 400, { success: false, message: 'Invalid JSON format.' });
                }
            });
        });
    }
    else {
        utils.sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed.' });
    }
};

module.exports = handlePhotographers;