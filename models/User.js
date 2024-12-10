const db = require('../db.js');
const utils = require('../utils/hash.js'); // Assuming this has hashing functions

class User {
    constructor(user_id, name, email, passwordHash, roles) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles; // New roles attribute
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [email], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            return row ? new User(row.user_id, row.name, row.email, row.password_hash, row.roles) : null;
        } catch (err) {
            throw err;
        }
    }

    static async findById(user_id) {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [user_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            return row ? new User(row.user_id, row.name, row.email, row.password_hash, row.roles) : null;
        } catch (err) {
            throw err;
        }
    }

    static async authenticate(email, password) {
        try {
            const user = await User.findByEmail(email);
            if (user && utils.comparePassword(password, user.passwordHash)) {
                return user;
            }
            return null;
        } catch (err) {
            throw err;
        }
    }

    static async create(name, email, password, roles = 'user') {
        const passwordHash = utils.hashPassword(password);
        const sql = 'INSERT INTO users (name, email, password_hash, roles, created_at) VALUES (?, ?, ?, ?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [name, email, passwordHash, roles, new Date().toISOString()], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return new User(result.lastID, name, email, passwordHash, roles);
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                roles TEXT,
                created_at TEXT
            );
        `;
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM users;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="users";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const sampleUsers = [
                {
                    user_id: 1,
                    name: 'Tyler Kushnick',
                    email: 'tak132@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: 'admin',
                    preferences: { theme: 'dark' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 2,
                    name: 'Michael Cerne',
                    email: 'mac873@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: '',
                    preferences: { theme: 'light' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 3,
                    name: 'Landon Araujo Gonzalez',
                    email: 'la563@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: '',
                    preferences: { theme: 'dark' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 4,
                    name: 'Alex Dolgin',
                    email: 'asd189@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: '',
                    preferences: { theme: 'light' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 5,
                    name: 'Dhrumil Patel',
                    email: 'dp1207@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: '',
                    preferences: { theme: 'dark' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 6,
                    name: 'Vivek Shivakumar',
                    email: 'vs726@scarletmail.rutgers.edu',
                    password: 'password123',
                    roles: '',
                    preferences: { theme: 'light' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 7,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    password: 'johnpassword',
                    roles: '',
                    preferences: { theme: 'dark' },
                    created_at: new Date().toISOString(),
                },
                {
                    user_id: 8,
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    password: 'janepassword',
                    roles: '',
                    preferences: { theme: 'light' },
                    created_at: new Date().toISOString(),
                },
            ];

            for (const user of sampleUsers) {
                await User.create(user.name, user.email, user.password, user.roles);
            }
        } catch (err) {
            throw err;
        }
    }

    save() {
        const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
        users.push(this);
        fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
    }
}

module.exports = User;