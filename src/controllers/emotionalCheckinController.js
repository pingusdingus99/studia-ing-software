const { EmotionalCheckin } = require('../models/db');

// Función para obtener la fecha de hoy en formato YYYY-MM-DD (en UTC)
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Crear o actualizar el check-in del día
const createOrUpdateCheckin = async (req, res) => {
    try {
        const { emoji } = req.body;
        const userId = req.user.id;
        const today = getTodayDate();

        if (!emoji) {
            return res.status(400).json({ message: 'El emoji es requerido.' });
        }

        // Busca o crea el check-in para el usuario y la fecha
        const [checkin, created] = await EmotionalCheckin.findOrCreate({
            where: {
                userId: userId,
                date: today
            },
            defaults: {
                emoji: emoji
            }
        });

        if (!created) {
            // Si ya existía (no fue creado), lo actualizamos
            checkin.emoji = emoji;
            await checkin.save();
        }

        res.status(200).json(checkin);

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

// Obtener el check-in del día actual
const getTodayCheckin = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayDate();

        const checkin = await EmotionalCheckin.findOne({
            where: {
                userId: userId,
                date: today
            }
        });

        res.status(200).json(checkin); // Devuelve el checkin o null

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el check-in.', error: error.message });
    }
};

module.exports = {
    createOrUpdateCheckin,
    getTodayCheckin
};