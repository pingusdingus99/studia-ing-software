const path = require('path');
const db = require('../models/db');

// Middleware para verificar que el hábito pertenece al usuario logueado
exports.checkHabitOwnership = async (req, res, next) => {
    // 1. Asegurarse de que el usuario está logueado
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const habitId = req.params.id || req.query.id; // Funciona con /:id o con ?id=
        const userId = req.session.user.id;

        const result = await db.query('SELECT user_id FROM habits WHERE id = $1', [habitId]);

        // 2. Si el hábito no existe o no pertenece al usuario
        if (result.rows.length === 0 || result.rows[0].user_id !== userId) {
            // No damos pistas, simplemente redirigimos a la página principal.
            return res.status(403).redirect('/');
        }

        // 3. Si todo está bien, continuamos a la siguiente función (showCalendar o infoHabito)
        next();
    } catch (error) {
        console.error("Error en middleware de verificación:", error);
        return res.status(500).send("Error interno del servidor.");
    }
};

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