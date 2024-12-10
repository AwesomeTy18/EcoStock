const fs = require('fs');
const path = require('path');

class Purchase {
    constructor(user_id, photo_id, receipt_url) {
        this.purchase_id = Date.now();
        this.user_id = user_id;
        this.photo_id = photo_id;
        this.purchase_date = new Date();
        this.receipt_url = receipt_url;
    }

    save() {
        const purchases = JSON.parse(fs.readFileSync(path.join(__dirname, 'purchases.json'), 'utf8'));
        purchases.push(this);
        fs.writeFileSync(path.join(__dirname, 'purchases.json'), JSON.stringify(purchases, null, 2));
    }

    static findByUserId(user_id) {
        const purchases = JSON.parse(fs.readFileSync(path.join(__dirname, 'purchases.json'), 'utf8'));
        return purchases.filter(purchase => purchase.user_id === user_id);
    }
}

module.exports = Purchase;