// scripts/populateSampleData.js

const fs = require('fs');
const path = require('path');
const utils = require('../utils/hash.js');

const User = require('../models/User.js');
const Photo = require('../models/Photo.js');
const Cart = require('../models/Cart.js');
const Purchase = require('../models/Purchase.js');
const Review = require('../models/Review.js');
const PhotoListing = require('../models/PhotoListing.js');

const db = require('../db.js'); // Ensure db.js initializes tables before seeding

// Populate all data using seed methods
const populateData = async () => {
    try {
        await User.seed();
        console.log('Users seeded successfully.');

        await Photo.seed();
        console.log('Photos seeded successfully.');

        await Cart.seed();
        console.log('Carts seeded successfully.');

        await Purchase.seed();
        console.log('Purchases seeded successfully.');

        await Review.seed();
        console.log('Reviews seeded successfully.');

        await PhotoListing.seed();
        console.log('Listings seeded successfully.');

        console.log('Sample data population completed successfully.');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};

// Perform a fake function on the DB.
db.get("SELECT 1", (err, row) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        populateData();
    }
});
