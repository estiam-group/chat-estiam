const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,

    MONGO_URL: process.env.MONGO_URL || '',//entrez le srv mongo ici
    SECRET_KEY: process.env.SECRET_KEY || 'sdfsdfv515151sdfsd',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "super_admin",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'azertyuiPassword',

    AES_KEY: process.env.AES_KEY || '01234567890123456789012345678901',
    IV : process.env.IV || '1234567890123456'
};
