const pool = require('../db');

class Checkin {
    static async create(user_id, mood) {
        if (!user_id || !mood) {
            throw new Error('Faltan datos del check-in');
        }

        // Verificar si ya hizo check-in hoy
        const result = await pool.query(
            'SELECT * FROM checkins WHERE user_id = $1 AND fecha = CURRENT_DATE',
            [user_id]
        );

        if (result.rows.length > 0) {
            throw new Error('Ya realizaste un check-in hoy.');
        }

        // Insertar check-in
        const insertResult = await pool.query(
            'INSERT INTO checkins (user_id, mood, fecha) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
            [user_id, mood]
        );

        console.log('✅ Check-in guardado para usuario:', user_id);
        return insertResult.rows[0];
    }
}

module.exports = Checkin;
