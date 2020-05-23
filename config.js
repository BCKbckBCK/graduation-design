const path = require('path');


module.exports = {
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASS: '19980502',
    DB_NAME: 'cpts',

    ADMIN_PREFIX: 'bck',
    HTTP_ROOT: 'http://localhost:8080',
    PORT: 8080,
    UPLOAD_DIR: path.resolve(__dirname, './static/upload'),
};