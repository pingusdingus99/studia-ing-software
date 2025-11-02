const db = require('../models/db');

const toggleHabit = async (req, res) => {
    const { habitId, date } = req.body;
    const userId = req.session.user.id;

    if (!habitId || !date) {
        return res.status(400).json({ success: false, message: 'Faltan datos (habitId, date).' });
    }

    try {
        // Primero, verificar que el hábito pertenece al usuario logueado por seguridad
        const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
        if (habitCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }

        // Intentar borrar primero (desmarcar)
        const deleteResult = await db.query(
            'DELETE FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habitId, date]
        );

        // Si no se borró ninguna fila, significa que no existía, entonces la insertamos (marcar)
        if (deleteResult.rowCount === 0) {
            await db.query('INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)', [habitId, date]);
            return res.json({ success: true, status: 'completed' });
        }

        res.json({ success: true, status: 'not-completed' });
    } catch (err) {
        console.error('Error al cambiar el estado del hábito:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const addHabit = async (req, res) => {
    const { habitName, habitDescription = '' } = req.body; // Asignar un valor por defecto
    const userId = req.session.user.id;

    if (!habitName || habitName.trim().length < 3) {
        // Por simplicidad, solo redirigimos. Podrías implementar mensajes de error con flash messages.
        return res.redirect('/');
    }

    try {
        await db.query(
            'INSERT INTO habits (user_id, name, description) VALUES ($1, $2, $3)',
            [userId, habitName.trim(), habitDescription.trim()]
        );
        res.redirect('/');
    } catch (err) {
        console.error('Error al agregar el hábito:', err);
        res.status(500).send('Error interno del servidor al intentar agregar el hábito.');
    }
};

module.exports = { toggleHabit, addHabit };
