const db = require('../models/db');
const Checkin = require('../models/checkin');
 
/**
 * @description Proporciona datos paginados para el scroll infinito de la página principal.
 */
exports.getMoreHabitsData = async (req, res) => {
    // 1. Verificar si el usuario está logueado
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    try {
        const userId = req.session.user.id;
        // El frontend nos dirá cuántos días ya tiene cargados para empezar desde ahí
        const offset = parseInt(req.query.offset, 10) || 0;
        const limit = 30; // Cargamos de 30 en 30 días

        // 2. Generar las próximas fechas
        const dates = Array.from({ length: limit }).map((_, i) => {
            const date = new Date();
            // El offset nos permite pedir las siguientes "páginas" de días
            date.setDate(date.getDate() - (offset + i));
            return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        });

        // 3. Obtener los registros de completado para esas fechas
        const firstDate = dates[dates.length - 1];
        const lastDate = dates[0];

        const completionsResult = await db.query(
            'SELECT habit_id, completion_date FROM habit_completions WHERE habit_id IN (SELECT id FROM habits WHERE user_id = $1) AND completion_date BETWEEN $2 AND $3',
            [userId, firstDate, lastDate]
        );

        // 4. Crear el mapa de completados como en mainController
        const completionsMap = {};
        completionsResult.rows.forEach(row => {
            const date = new Date(row.completion_date).toISOString().split('T')[0];
            const key = `${row.habit_id}-${date}`;
            completionsMap[key] = true;
        });

        // 5. Enviar los nuevos datos al frontend
        res.json({ success: true, dates, completionsMap });
    } catch (err) {
        console.error('Error al obtener más datos de hábitos:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/**
 * @description Obtiene los detalles de un check-in para una fecha específica.
 */
exports.getCheckinDetails = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    try {
        const userId = req.session.user.id;
        const { date } = req.params;

        const checkinData = await Checkin.getByDate(userId, date);

        if (!checkinData) {
            return res.status(404).json({ success: false, message: 'No se encontró un check-in para esta fecha.' });
        }

        res.json({ success: true, data: checkinData });
    } catch (err) {
        console.error('Error al obtener detalles del check-in:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};