// scripts/populateSampleData.js

const fs = require('fs');
const path = require('path');
const utils = require('../utils/hash.js');

const User = require('../models/User.js');
const Photo = require('../models/Photo.js');
const Cart = require('../models/Cart.js');
const Purchase = require('../models/Purchase.js');
const Payout = require('../models/Payout.js');
const Review = require('../models/Review.js');
const Notification = require('../models/Notification.js');
const PhotoListing = require('../models/PhotoListing.js');

const db = require('../db.js'); // Ensure db.js initializes tables before seeding

// Populate all data using seed methods
const populateData = () => {
    User.seed((err) => {
        if (err) {
            console.error('Error seeding users:', err);
        } else {
            console.log('Users seeded successfully.');
            Photo.seed((err) => {
                if (err) {
                    console.error('Error seeding photos:', err);
                } else {
                    console.log('Photos seeded successfully.');
                    Cart.seed((err) => { // Updated to use Cart.seed
                        if (err) {
                            console.error('Error seeding carts:', err);
                        } else {
                            console.log('Carts seeded successfully.');
                            Purchase.seed((err) => {
                                if (err) {
                                    console.error('Error seeding purchases:', err);
                                } else {
                                    console.log('Purchases seeded successfully.');
                                    Payout.seed((err) => {
                                        if (err) {
                                            console.error('Error seeding payouts:', err);
                                        } else {
                                            console.log('Payouts seeded successfully.');
                                            Review.seed((err) => {
                                                if (err) {
                                                    console.error('Error seeding reviews:', err);
                                                } else {
                                                    console.log('Reviews seeded successfully.');
                                                    Notification.seed((err) => {
                                                        if (err) {
                                                            console.error('Error seeding notifications:', err);
                                                        } else {
                                                            console.log('Notifications seeded successfully.');
                                                            PhotoListing.seed((err) => {
                                                                if (err) {
                                                                    console.error('Error seeding listings:', err);
                                                                } else {
                                                                    console.log('Listings seeded successfully.');
                                                                    console.log('Sample data population completed successfully.');
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

populateData();