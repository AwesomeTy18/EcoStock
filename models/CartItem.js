const db = require('../db.js');

class CartItem {
    constructor(cart_id, photo_id, quantity) {
        this.cart_id = cart_id;
        this.photo_id = photo_id;
        this.quantity = quantity;
    }

    static async addItem(cart_id, photo_id, quantity = 1) {
        const sql = `INSERT INTO cart_items (cart_id, photo_id, quantity)
                     VALUES (?, ?, ?)
                     ON CONFLICT(cart_id, photo_id) DO UPDATE SET quantity = quantity + ?`;
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [cart_id, photo_id, quantity, quantity], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static async removeItem(cart_id, photo_id) {
        const sql = 'DELETE FROM cart_items WHERE cart_id = ? AND photo_id = ?';
        try {
            await new Promise((resolve, reject) => {
                db.run(sql, [cart_id, photo_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }

    async save() {
        const sql = `INSERT INTO cart_items (cart_id, photo_id, quantity)
                     VALUES (?, ?, ?)
                     ON CONFLICT(cart_id, photo_id) DO UPDATE SET quantity = quantity + ?`;
        try {
            const result = await new Promise((resolve, reject) => {
                db.run(sql, [this.cart_id, this.photo_id, this.quantity, this.quantity], function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                });
            });
            return result.lastID;
        } catch (err) {
            throw err;
        }
    }

    static async findByCartId(cart_id) {
        const sql = 'SELECT * FROM cart_items WHERE cart_id = ?';
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [cart_id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows.map(row => new CartItem(row.cart_id, row.photo_id, row.quantity));
        } catch (err) {
            throw err;
        }
    }

    static getTableDefinition() {
        return `
            CREATE TABLE IF NOT EXISTS cart_items (
                cart_id INTEGER,
                photo_id INTEGER,
                quantity INTEGER,
                PRIMARY KEY (cart_id, photo_id),
                FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
                FOREIGN KEY (photo_id) REFERENCES photos(photo_id)
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

            const sampleCartItems = [
                { cart_id: 201, photo_id: 101, quantity: 1 },
                { cart_id: 201, photo_id: 102, quantity: 2 },
                { cart_id: 202, photo_id: 103, quantity: 1 },
            ];

            for (const item of sampleCartItems) {
                const cartItem = new CartItem(item.cart_id, item.photo_id, item.quantity);
                await cartItem.save();
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CartItem;
