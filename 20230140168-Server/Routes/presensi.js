const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
// Ganti addUserData dengan authenticateToken
const { authenticateToken } = require('../middleware/permissionMiddleware');

router.use(authenticateToken); // Semua route di bawah ini butuh login

router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

module.exports = router;