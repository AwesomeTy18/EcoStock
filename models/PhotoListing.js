const fs = require('fs');
const path = require('path');

class PhotoListing {
    constructor(photo_id, price, status = 'Available') {
        this.listing_id = Date.now();
        this.photo_id = photo_id;
        this.price = price;
        this.status = status;
        this.created_at = new Date();
    }

    save() {
        const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
        listings.push(this);
        fs.writeFileSync(path.join(__dirname, 'listings.json'), JSON.stringify(listings, null, 2));
    }

    static findByPhotoId(photo_id) {
        const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
        return listings.find(listing => listing.photo_id === photo_id);
    }

    static updateStatus(listing_id, newStatus) {
        const listings = JSON.parse(fs.readFileSync(path.join(__dirname, 'listings.json'), 'utf8'));
        const listing = listings.find(l => l.listing_id === listing_id);
        if (listing) {
            listing.status = newStatus;
            fs.writeFileSync(path.join(__dirname, 'listings.json'), JSON.stringify(listings, null, 2));
            return listing;
        }
        return null;
    }
}

module.exports = PhotoListing;