// scripts/populateSampleData.js

const fs = require('fs');
const path = require('path');
const utils = require('../utils/hash.js');

// Define the path to the data files
const dataDir = path.join(__dirname, '..', 'models');

const dataFiles = {
    users: path.join(dataDir, 'users.json'),
    photos: path.join(dataDir, 'photos.json'),
    carts: path.join(dataDir, 'carts.json'),
    purchases: path.join(dataDir, 'purchases.json'),
    payouts: path.join(dataDir, 'payouts.json'),
    reviews: path.join(dataDir, 'reviews.json'),
    notifications: path.join(dataDir, 'notifications.json'),
    listings: path.join(dataDir, 'listings.json'),
};

// Sample Data Definitions
const sampleUsers = [
    {
        user_id: 1,
        name: 'Tyler Kushnick',
        email: 'tak132@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'dark' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 2,
        name: 'Michael Cerne',
        email: 'mac873@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'light' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 3,
        name: 'Landon Araujo Gonzalez',
        email: 'la563@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'dark' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 4,
        name: 'Alex Dolgin',
        email: 'asd189@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'light' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 5,
        name: 'Dhrumil Patel',
        email: 'dp1207@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'dark' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 6,
        name: 'Vivek Shivakumar',
        email: 'vs726@scarletmail.rutgers.edu',
        password_hash: utils.hashPassword('password123'),
        preferences: { theme: 'light' },
        created_at: new Date().toISOString(),
    },
    // Additional Users
    {
        user_id: 7,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password_hash: utils.hashPassword('johnpassword'),
        preferences: { theme: 'dark' },
        created_at: new Date().toISOString(),
    },
    {
        user_id: 8,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password_hash: utils.hashPassword('janepassword'),
        preferences: { theme: 'light' },
        created_at: new Date().toISOString(),
    },
];

const samplePhotos = [
    {
        photo_id: 101,
        photographer_id: 1, // Added Photographer ID
        title: 'Sunset Over Mountains',
        description: 'A beautiful sunset over the rocky mountains.',
        price: 29.99,
        location: 'Rocky Mountains',
        date_taken: '2023-08-15',
        watermark_url: '/photos/watermark101.jpg',
        high_res_url: '/photos/highres101.jpg',
        created_at: new Date().toISOString(),
    },
    {
        photo_id: 102,
        photographer_id: 2, // Added Photographer ID
        title: 'Calm Lake',
        description: 'A serene lake surrounded by trees.',
        price: 19.99, // Added Price
        location: 'Deep Forest',
        date_taken: '2023-08-20',
        watermark_url: '/photos/watermark102.jpg',
        high_res_url: '/photos/highres102.jpg',
        created_at: new Date().toISOString(),
    },
    {
        photo_id: 103,
        photographer_id: 3,
        price: 39.99,
        title: 'Desert Dunes',
        description: 'Expansive sand dunes under a clear blue sky.',
        location: 'Sahara Desert',
        date_taken: '2023-06-20',
        watermark_url: '/photos/watermark103.jpg',
        high_res_url: '/photos/highres103.jpg',
        created_at: new Date().toISOString(),
    },
    // Additional Photos
    {
        photo_id: 104,
        photographer_id: 4,
        price: 24.99,
        title: 'Ocean Waves',
        description: 'Powerful waves crashing onto the shore.',
        location: 'Pacific Ocean',
        date_taken: '2023-05-18',
        watermark_url: '/photos/watermark104.jpg',
        high_res_url: '/photos/highres104.jpg',
        created_at: new Date().toISOString(),
    },
    {
        photo_id: 105,
        photographer_id: 5,
        price: 34.99,
        title: 'Autumn Leaves',
        description: 'Colorful autumn leaves falling from the trees.',
        location: 'New England',
        date_taken: '2023-10-05',
        watermark_url: '/photos/watermark105.jpg',
        high_res_url: '/photos/highres105.jpg',
        created_at: new Date().toISOString(),
    },
];

const sampleCarts = [
    {
        cart_id: 201,
        user_id: 7, // John Doe
        items: [
            { photo_id: 101, quantity: 1 },
            { photo_id: 102, quantity: 2 },
        ],
        added_at: new Date().toISOString(),
    },
    {
        cart_id: 202,
        user_id: 8, // Jane Smith
        items: [
            { photo_id: 103, quantity: 1 },
        ],
        added_at: new Date().toISOString(),
    },
];

const samplePurchases = [
    {
        purchase_id: 301,
        user_id: 7, // John Doe
        photo_id: 101,
        purchase_date: '2023-09-01T10:00:00Z',
        receipt_url: 'http://example.com/receipts/301.json',
    },
    {
        purchase_id: 302,
        user_id: 8, // Jane Smith
        photo_id: 102,
        purchase_date: '2023-09-02T11:30:00Z',
        receipt_url: 'http://example.com/receipts/302.json',
    },
];

const samplePayouts = [
    {
        payout_id: 401,
        photographer_id: 1,
        amount: 850.00,
        payout_date: '2023-09-15T09:00:00Z',
        status: 'Completed',
    },
    {
        payout_id: 402,
        photographer_id: 2,
        amount: 425.00,
        payout_date: '2023-09-15T09:00:00Z',
        status: 'Pending',
    },
];

const sampleReviews = [
    {
        review_id: 501,
        user_id: 7, // John Doe
        photo_id: 101,
        rating: 5,
        review_text: 'Stunning view! Amazing colors.',
        created_at: '2023-09-05T14:20:00Z',
    },
    {
        review_id: 502,
        user_id: 8, // Jane Smith
        photo_id: 102,
        rating: 4,
        review_text: 'Very peaceful and calming.',
        created_at: '2023-09-06T16:45:00Z',
    },
];

const sampleNotifications = [
    {
        notification_id: 601,
        user_id: 7, // John Doe
        message: 'Your purchase of "Sunset Over Mountains" was successful.',
        is_read: false,
        created_at: '2023-09-01T10:05:00Z',
    },
    {
        notification_id: 602,
        user_id: 8, // Jane Smith
        message: 'Your payout of $425.00 is pending.',
        is_read: false,
        created_at: '2023-09-15T09:05:00Z',
    },
];

const sampleListings = [
    {
        listing_id: 701,
        photo_id: 101,
        price: 100.00,
        status: 'Available',
        created_at: '2023-08-16T08:00:00Z',
    },
    {
        listing_id: 702,
        photo_id: 102,
        price: 200.00,
        status: 'Available',
        created_at: '2023-07-11T09:30:00Z',
    },
    {
        listing_id: 703,
        photo_id: 103,
        price: 150.00,
        status: 'Unavailable',
        created_at: '2023-06-21T10:15:00Z',
    },
    {
        listing_id: 704,
        photo_id: 104,
        price: 75.00,
        status: 'Available',
        created_at: '2023-05-19T11:45:00Z',
    },
    {
        listing_id: 705,
        photo_id: 105,
        price: 125.00,
        status: 'Available',
        created_at: '2023-10-06T12:00:00Z',
    }
];

// Function to write data to JSON files
const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Data written to ${filePath}`);
};

// Populate all data files
const populateData = () => {
    try {
        writeData(dataFiles.users, sampleUsers);
        writeData(dataFiles.photos, samplePhotos);
        writeData(dataFiles.carts, sampleCarts);
        writeData(dataFiles.purchases, samplePurchases);
        writeData(dataFiles.payouts, samplePayouts);
        writeData(dataFiles.reviews, sampleReviews);
        writeData(dataFiles.notifications, sampleNotifications);
        writeData(dataFiles.listings, sampleListings);
        console.log('Sample data population completed successfully.');
    } catch (error) {
        console.error('Error populating sample data:', error);
    }
};

populateData();