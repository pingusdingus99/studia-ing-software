const pool = require('./db');


class Checkin {
  static async create(user_id, mood, emoji, reflection) {
    const result = await pool.query(
      `INSERT INTO checkins (user_id, mood, emoji, reflection)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, mood, emoji, reflection]
    );
    return result.rows[0];
  }

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
}

module.exports = Checkin;
