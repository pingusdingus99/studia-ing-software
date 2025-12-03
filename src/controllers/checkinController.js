// src/controllers/checkinController.js
const Checkin = require('../models/checkin');

module.exports = {
  // GET /checkin -> muestra el formulario
  renderCheckinForm(req, res) {
    if (!req.session.user) return res.redirect('/auth/login');
    res.sendFile('checkin.html', { root: './views' });
  },

  // POST /checkin -> guarda el check-in
  async submitCheckin(req, res) {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ detail: "No autenticado" });
      }

      const { mood, emoji, reflection } = req.body;

      if (!mood || !emoji) {
        return res.status(400).json({ detail: "Faltan datos" });
      }

      const newCheckin = await Checkin.create(
        user.id,
        mood,
        emoji,
        reflection || null
      );

      return res.status(200).json({
        ok: true,
        message: "✅ Check-in guardado",
        checkin: newCheckin
      });

    } catch (error) {
      console.error(error);

      // ⚠️ Caso especial: ya hizo check-in hoy
      if (
        error.code === 'CHECKIN_DUPLICADO' ||
        (typeof error.message === 'string' &&
         error.message.includes('Ya realizaste un check-in hoy'))
      ) {
        return res.status(400).json({
          ok: false,
          detail: error.message,
          alreadyDone: true
        });
      }

      // Otros errores
      return res.status(500).json({ ok: false, detail: "Error al guardar check-in" });
    }
  },

  // GET /checkin/today -> obtener check-in del día
  async getTodayCheckin(req, res) {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ detail: "No autenticado" });
      }

      const checkin = await Checkin.getToday(user.id);
      return res.json(checkin || {});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ detail: "Error al obtener check-in" });
    }
  }
};
