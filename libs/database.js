const mysql = require('mysql');
const co = require('co-mysql');
const config = require('../config');

let conn = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME

});
let con = co(conn);

module.exports = con;