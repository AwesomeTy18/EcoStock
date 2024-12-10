const Photo = require('../models/Photo');
const PhotoListing = require('../models/PhotoListing');

const getPhotoWithPrice = (photo_id) => {
    const photo = Photo.findById(photo_id);
    const listing = PhotoListing.findByPhotoId(photo_id);

    if (photo && listing) {
        return {
            ...photo,
            price: listing.price,
            status: listing.status
        };
    } else if (photo) {
        return {
            ...photo,
            price: 'N/A',
            status: 'Unavailable'
        };
    }
    return null;
};

module.exports = {
    getPhotoWithPrice
};