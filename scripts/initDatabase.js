const db = require('../db.js');
const fs = require('fs');
const path = require('path');

console.log('Initializing database tables...');
db.serialize(() => {

    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) {
            console.error('Error enabling foreign keys:', err.message);
            process.exit(1);
        } else {
            console.log('Foreign key constraints enabled.');
        }
    });

    // Explicitly require models in order of dependencies
    const User = require('../models/User.js');
    const Photo = require('../models/Photo.js');
    const PhotoListing = require('../models/PhotoListing.js');
    const Purchase = require('../models/Purchase.js');
    const Review = require('../models/Review.js');
    const Cart = require('../models/Cart.js');
    const Payout = require('../models/Payout.js');
    const CartItem = require('../models/CartItem.js');

    // Define the initialization order
    const modelsInOrder = [
        User,
        CartItem,
        Cart,
        PhotoListing,
        Photo,
        Purchase,
        Review,
        Payout
    ];

    // Initialize tables in the specified order
    modelsInOrder.forEach(model => {
        const tableDefinitions = model.getTableDefinition().split(';').filter(Boolean);
        tableDefinitions.forEach(tableDefinition => {
            db.run(tableDefinition.trim() + ';', (err) => {
                if (err !== null) {
                    console.error(`Error creating table for model ${model.name}:`, err.message);
                } else {
                    console.log(`Table for model ${model.name} initialized.`);
                }
            });
        });
    });

    console.log('Database initialization completed.');

});