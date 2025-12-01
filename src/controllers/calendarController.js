const path = require('path');
const db = require('../models/db');

// Mostrar página del calendario (HTML estático)
exports.showCalendar = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/calendar.html'));
};

// API para obtener información del hábito + completitud
exports.infoHabito = async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Obtener el NOMBRE del hábito
        const habitQuery = 'SELECT name FROM habits WHERE id = $1';
        const habitResult = await db.query(habitQuery, [id]);

        if (habitResult.rows.length === 0) {
            return res.status(404).json({ mensaje: "Hábito no encontrado" });
        }

        const habitName = habitResult.rows[0].name;

        // 2. Obtener los REGISTROS de completitud
        const completionsQuery = 'SELECT completion_date, status FROM habit_completions WHERE habit_id = $1';
        const completionsResult = await db.query(completionsQuery, [id]);

        // 3. Enviar respuesta unificada
        // Devolvemos un objeto con ambas cosas: el nombre y el array de registros
        res.json({
            name: habitName,
            completions: completionsResult.rows
        }); 

    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};