const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'photoapp',
    password: 'CSC317Th!',
    database: 'CSC317DB',
    //debug: true,

});

const  promisePool = pool.promise;

module.exports = promisePool;
