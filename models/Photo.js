const fs = require('fs');
const path = require('path');

class Photo {
    constructor(photo_id, photographer_id, price, title, description, location, date_taken, watermark_url, high_res_url, created_at) {
        this.photo_id = photo_id;
        this.photographer_id = photographer_id;
        this.price = price;
        this.title = title;
        this.description = description;
        this.location = location;
        this.date_taken = date_taken;
        this.watermark_url = watermark_url;
        this.high_res_url = high_res_url;
        this.created_at = created_at;
    }

    save() {
        const photos = JSON.parse(fs.readFileSync(path.join(__dirname, 'photos.json'), 'utf8'));
        photos.push(this);
        fs.writeFileSync(path.join(__dirname, 'photos.json'), JSON.stringify(photos, null, 2));
    }

    /**
     * Finds a photo by its ID.
     * @param {number} id 
     * @returns {Photo|null}
     */
    static findById(id) {
        const photos = JSON.parse(fs.readFileSync(path.join(__dirname, 'photos.json'), 'utf8'));
        const photoData = photos.find(p => p.photo_id === id);
        return photoData ? new Photo(
            photoData.photo_id,
            photoData.photographer_id,
            photoData.price,
            photoData.title,
            photoData.description,
            photoData.location,
            photoData.date_taken,
            photoData.watermark_url,
            photoData.high_res_url,
            photoData.created_at
        ) : null;
    }

    static findAll() {
        const photos = JSON.parse(fs.readFileSync(path.join(__dirname, 'photos.json'), 'utf8'));
        return photos.map(photoData => new Photo(
            photoData.photo_id,
            photoData.photographer_id,
            photoData.price,
            photoData.title,
            photoData.description,
            photoData.location,
            photoData.date_taken,
            photoData.watermark_url,
            photoData.high_res_url,
            photoData.created_at
        ));
    }

    static create(id, title, description, price, watermark_url, high_res_url, photographer_id) {
        const photo_id = id; // Set a unique ID
        const location = 'Unknown'; // Set a default or obtain as needed
        const date_taken = new Date().toISOString(); // Set appropriately
        const created_at = new Date().toISOString();
        const newPhoto = new Photo(
            photo_id,
            photographer_id,
            price,
            title,
            description,
            location,
            date_taken,
            watermark_url,
            high_res_url,
            created_at
        );
        newPhoto.save();
        return newPhoto;
    }

    // Add other necessary methods as needed
}

module.exports = Photo;