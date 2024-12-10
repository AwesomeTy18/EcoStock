const bcrypt = require('bcrypt');

const utils = {};

utils.hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
};

utils.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = utils;