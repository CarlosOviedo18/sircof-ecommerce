import mysql from 'mysql2/promise';
import keys from './keys.js';

const pool = mysql.createPool(keys.database);

export default pool;
