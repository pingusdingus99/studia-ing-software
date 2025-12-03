const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

router.get('/', checkinController.renderCheckinForm);
router.post('/', checkinController.submitCheckin);

// API para obtener el check-in del día
router.get('/today', checkinController.getTodayCheckin);

module.exports = router;
