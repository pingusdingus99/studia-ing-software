// src/models/checkin.js
const pool = require('./db');

class Checkin {
  static async create(user_id, mood, emoji, reflection) {
    // 🔍 1. Verificar si ya existe un check-in hoy para este usuario
    const checkToday = await pool.query(
      `SELECT id FROM checkins 
       WHERE user_id = $1 
       AND fecha = CURRENT_DATE`,
      [user_id]
    );

    if (checkToday.rows.length > 0) {
      const error = new Error('Ya realizaste un check-in hoy 🗓️. Vuelve mañana 🙂');
      error.code = 'CHECKIN_DUPLICADO';
      throw error;
    }

    // 📝 2. Crear nuevo check-in
    const result = await pool.query(
      `INSERT INTO checkins (user_id, mood, emoji, reflection, fecha)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING *`,
      [user_id, mood, emoji, reflection]
    );

    return result.rows[0];
  }

  // 📅 Obtener check-in del día
  static async getToday(user_id) {
    const result = await pool.query(
      `SELECT * FROM checkins
       WHERE user_id = $1 AND fecha = CURRENT_DATE
       ORDER BY id DESC
       LIMIT 1`,
      [user_id]
    );
    return result.rows[0];
  }

  static async getForDateRange(user_id, startDate, endDate) {
    const result = await pool.query(
      `SELECT fecha, emoji FROM checkins
       WHERE user_id = $1 AND fecha BETWEEN $2 AND $3`,
      [user_id, startDate, endDate]
    );
    return result.rows;
  }

  static async getByDate(user_id, date) {
    const result = await pool.query(
      `SELECT mood, emoji, reflection, fecha FROM checkins
       WHERE user_id = $1 AND fecha = $2
       ORDER BY id DESC
       LIMIT 1`,
      [user_id, date]
    );
    return result.rows[0];
  }
}

module.exports = Checkin;
