// Importamos el cliente de postgres
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Creamos un pool de conexiones usando la URL del .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Exportamos funciones para usar en otros archivos
module.exports = {
    query: (text, params) => pool.query(text, params)
};