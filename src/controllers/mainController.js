const path = require('path');
const db = require('../models/db');

const homePage = async (req, res) => {
    // 1. Verificar si el usuario está logueado
    if (!req.session.user) {
        // Si no está logueado, renderiza la página sin datos de hábitos
        return res.render('index', { user: null, habits: [], dates: [], completionsMap: {} });
    }

    try {
        const userId = req.session.user.id;

        // 2. Obtener los hábitos del usuario
        const habitsResult = await db.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        const habits = habitsResult.rows;

        // Generar los últimos 30 días para permitir el scroll
        const dates = Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        });

        // 3. Obtener los registros de completado de los últimos 7 días
        const completionsResult = await db.query(
            'SELECT habit_id, completion_date FROM habit_completions WHERE habit_id IN (SELECT id FROM habits WHERE user_id = $1) AND completion_date >= $2',
            [userId, dates[dates.length - 1]]
        );

        // Crear un mapa para buscar eficientemente si un hábito fue completado en una fecha
        // La clave será "habitId-YYYY-MM-DD"
        const completionsMap = {};
        completionsResult.rows.forEach(row => {
            const date = new Date(row.completion_date).toISOString().split('T')[0];
            const key = `${row.habit_id}-${date}`;
            completionsMap[key] = true;
        });

        // 4. Pasar los datos a la vista
        res.render('index', { user: req.session.user, habits, dates, completionsMap });

    } catch (err) {
        console.error('Error al obtener los datos de la página principal:', err);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = { homePage };