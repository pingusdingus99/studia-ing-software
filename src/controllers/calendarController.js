const path = require('path');
const db = require('../models/db');

// Mostrar página
exports.showCalendar = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/calendar.html'));
};

exports.infoHabito = async (req, res) => {
    try {
        // Obtenemos el ID de los parámetros de la URL
        const id = 1;//req.params.id;
        
        // 1. La consulta SQL correcta (seleccionando columnas específicas)
        const sqlQuery = 'SELECT date, status FROM registers WHERE habit_id = $1';
        
        const registros = await db.query(sqlQuery, [id]);

        // 2. Enviamos solo las filas (rows) como JSON
        // Esto es lo que tu 'fetch' en calendar.js recibirá
        res.json(registros.rows); 

    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};