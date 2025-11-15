const path = require('path');
const Checkin = require('../models/checkin');

const createCheckin = async (req, res) => {
    try {
        // Obtener usuario desde la sesión
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ detail: 'Debes iniciar sesión antes de hacer check-in.' });
        }

        const user_id = req.session.user.id;
        const { mood } = req.body;

        if (!mood) {
            return res.status(400).json({ detail: 'Falta el nivel de ánimo.' });
        }

        // Guardar check-in
        const checkin = await Checkin.create(user_id, mood);
        res.json({
            message: '✅ Check-in guardado correctamente',
            fecha: checkin.fecha,
            mood: checkin.mood
        });
    } catch (err) {
        res.status(400).json({ detail: err.message });
    }
};

// Sirve el HTML
const checkinPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/checkin.html'));
};

module.exports = { createCheckin, checkinPage };
