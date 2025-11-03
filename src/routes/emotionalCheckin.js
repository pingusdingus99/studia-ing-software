const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkinController = require('../controllers/emotionalCheckinController');

router.post('/api/checkin', authMiddleware, checkinController.createOrUpdateCheckin);

router.get('/api/checkin/today', authMiddleware, checkinController.getTodayCheckin);

module.exports = router;
