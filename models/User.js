const fs = require('fs');
const path = require('path');
const utils = require('../utils/hash.js'); // Assuming this has hashing functions

class User {
    constructor(user_id, name, email, passwordHash, roles) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles; // New roles attribute
    }

    static findByEmail(email) {
        const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
        return users.find(user => user.email === email);
    }

    static findById(user_id) {
        const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
        return users.find(user => user.user_id === user_id);
    }

    static authenticate(email, password) {
        const user = User.findByEmail(email);
        if (user && utils.comparePassword(password, user.password_hash)) { // Use comparePassword
            return new User(user.user_id, user.name, user.email, user.password_hash, user.roles);
        }
        return null;
    }

    static create(name, email, password, roles = []) {
        const fs = require('fs');
        const path = require('path');
        const usersPath = path.join(__dirname, 'users.json');
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

        const userId = users.length ? users[users.length - 1].user_id + 1 : 1;
        const passwordHash = utils.hashPassword(password);

        const newUser = {
            user_id: userId,
            name: name,
            email: email,
            password_hash: passwordHash,
            roles: roles, // Add roles during creation
            preferences: {},
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

        return new User(newUser.user_id, newUser.name, newUser.email, newUser.password_hash, newUser.roles);
    }
}

module.exports = User;