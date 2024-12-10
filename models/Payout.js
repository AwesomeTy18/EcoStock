const fs = require('fs');
const path = require('path');

class Payout {
    constructor(photographer_id, amount, status = 'Pending') {
        this.payout_id = Date.now();
        this.photographer_id = photographer_id;
        this.amount = amount;
        this.payout_date = new Date();
        this.status = status;
    }

    save() {
        const payouts = JSON.parse(fs.readFileSync(path.join(__dirname, 'payouts.json'), 'utf8'));
        payouts.push(this);
        fs.writeFileSync(path.join(__dirname, 'payouts.json'), JSON.stringify(payouts, null, 2));
    }

    static findByPhotographerId(photographer_id) {
        const payouts = JSON.parse(fs.readFileSync(path.join(__dirname, 'payouts.json'), 'utf8'));
        return payouts.filter(payout => payout.photographer_id === photographer_id);
    }

    static updateStatus(payout_id, newStatus) {
        const payouts = JSON.parse(fs.readFileSync(path.join(__dirname, 'payouts.json'), 'utf8'));
        const payout = payouts.find(p => p.payout_id === payout_id);
        if (payout) {
            payout.status = newStatus;
            fs.writeFileSync(path.join(__dirname, 'payouts.json'), JSON.stringify(payouts, null, 2));
            return payout;
        }
        return null;
    }
}

module.exports = Payout;