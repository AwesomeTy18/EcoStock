const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'database.db');

// Open or create the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not open database', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Export the database connection
module.exports = db;