const db = require('../db.js');
const CartItem = require('./CartItem.js');

class Cart {
    constructor(cart_id, user_id, added_at, items = []) {
        this.cart_id = cart_id;
        this.user_id = user_id;
        this.items = items;
        this.added_at = added_at;
    }

    async addItem(photo_id, quantity = 1) {
        try {
            await CartItem.addItem(this.cart_id, photo_id, quantity);
            this.items.push({ photo_id, quantity });
        } catch (err) {
            throw err;
        }
    }

    async removeItem(photo_id) {
        try {
            await CartItem.removeItem(this.cart_id, photo_id);
            this.items = this.items.filter(item => item.photo_id !== photo_id);
        } catch (err) {
            throw err;
        }
    }

    static async create(user_id) {
        const sql = 'INSERT INTO carts (user_id, added_at) VALUES (?, ?)';
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [user_id, new Date().toISOString()], function(err) {
                    if (err) reject(err);
                    else resolve(new Cart(this.lastID, user_id, new Date().toISOString()));
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    async save() {
        const sql = `INSERT INTO carts (cart_id, user_id, added_at)
                     VALUES (?, ?, ?)
                     ON CONFLICT(cart_id) DO UPDATE SET added_at = ?`;
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [this.cart_id, this.user_id, new Date().toISOString(), new Date().toISOString()], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
            if (this.items.length === 0) {
                const deleteSql = 'DELETE FROM cart_items WHERE cart_id = ?';
                await new Promise((resolve, reject) => {
                    db.run(deleteSql, [this.cart_id], function(err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        } catch (err) {
            throw err;
        }
    }

    static async findByUserId(user_id) {
        const sql = 'SELECT * FROM carts WHERE user_id = ?';
        try {
            const row = await new Promise((resolve, reject) => {
                db.get(sql, [user_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            if (row) {
                const cart = new Cart(row.cart_id, row.user_id, row.added_at);
                const items = await CartItem.findByCartId(cart.cart_id);
                cart.items = items;
                return cart;
            } else {
                return null;
            }
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS carts (
                cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                added_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `;
    }

    static async seed() {
        try {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM cart_items;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM carts;', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM sqlite_sequence WHERE name="carts";', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

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
            
            for (const cartData of sampleCarts) {
                const cart = new Cart(cartData.cart_id, cartData.user_id, cartData.added_at);
                await cart.save();
                for (const item of cartData.items) {
                    await cart.addItem(item.photo_id, item.quantity);
                }
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Cart;