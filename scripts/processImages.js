const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directory containing the images
const imagesDir = path.join(__dirname, '../public/photos');
const watermarkPath = path.join(__dirname, '../public/watermark.png'); // Path to the watermark image

// Function to process images
async function processImages() {
    try {
        const files = fs.readdirSync(imagesDir);

        for (const file of files) {
            if (file.startsWith('highres')) {
                const inputPath = path.join(imagesDir, file);
                const fileNumber = file.match(/\d+/)[0]; // Extract the numeric part
                const outputPath = path.join(imagesDir, `watermark${fileNumber}.jpg`);

                console.log(`Processing ${file}...`);

                // Add watermark and downsample to 720p
                try {
                    await sharp(inputPath)
                        .resize({ width: 1280, height: 720, fit: 'inside' }) // Downsample to 720p
                        .composite([{ input: watermarkPath, gravity: 'center' }]) // Add watermark
                        .toFile(outputPath);
                }
                catch (error) {
                    console.error(`Error processing ${file}:`, error);
                    continue; // Skip to the next file
                }
                console.log(`Processed ${file} and saved as ${outputPath}`);
            }
        }

        console.log('All images processed successfully.');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

module.exports = processImages;