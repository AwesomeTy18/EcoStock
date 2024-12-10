// models/Cart.js
const fs = require('fs');
const path = require('path');

class Cart {
    constructor(user_id, cart_id = Date.now(), items = [], added_at = new Date()) {
        this.cart_id = cart_id;
        this.user_id = user_id;
        this.items = items;
        this.added_at = added_at;
    }

    addItem(photo_id, quantity = 1) {
        const existingItem = this.items.find(item => item.photo_id === photo_id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ photo_id, quantity });
        }
        this.save();
    }

    removeItem(photo_id) {
        this.items = this.items.filter(item => item.photo_id !== photo_id);
        this.save();
    }

    save() {
        const cartsPath = path.join(__dirname, 'carts.json');
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
        const existingCartIndex = carts.findIndex(cart => cart.cart_id === this.cart_id);

        if (existingCartIndex !== -1) {
            // Update existing cart
            carts[existingCartIndex] = this;
            console.log(`Updated cart at index ${existingCartIndex}:`, carts[existingCartIndex]); // **Debugging Log**
        } else {
            // Add new cart
            carts.push(this);
            console.log('Added new cart:', this); // **Debugging Log**
        }

        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
        console.log('Carts saved successfully.'); // **Debugging Log**
    }

    static findByUserId(user_id) {
        const cartsPath = path.join(__dirname, 'carts.json');
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
        const cartData = carts.find(cart => cart.user_id === user_id) || null;
        console.log(`findByUserId(${user_id}) returned:`, cartData); // **Debugging Log**
        
        if (cartData) {
            return new Cart(
                cartData.user_id,
                cartData.cart_id,
                cartData.items,
                new Date(cartData.added_at)
            );
        }
        return null;
    }
}

module.exports = Cart;