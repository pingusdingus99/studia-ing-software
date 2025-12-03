const Checkin = require('../models/checkin');

module.exports = {
  renderCheckinForm(req, res) {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('checkin.html', { root: './views' });
  },

  async submitCheckin(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.status(401).json({ detail: "No autenticado" });

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

      res.json({
        message: "Check-in guardado",
        checkin: newCheckin
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ detail: "Error al guardar check-in" });
    }
  },

  async getTodayCheckin(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.status(401).json({ detail: "No autenticado" });

      const checkin = await Checkin.getToday(user.id);
      res.json(checkin || {});
    } catch (error) {
      res.status(500).json({ detail: "Error al obtener check-in" });
    }
  }
};
