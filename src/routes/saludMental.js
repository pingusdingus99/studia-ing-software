const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * @route GET /methods
 * @description Muestra la página estática con los métodos de estudio.
 */
router.get('/mentalHealth', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'apoyoSaludMental.html'));
});

module.exports = router;
