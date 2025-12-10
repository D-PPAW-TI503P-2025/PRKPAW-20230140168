const express = require('express');
const router = express.Router();

// Import controller dan middleware
const presensiController = require('../controllers/presensiController');
const { authenticateToken } = require('../middleware/permissionMiddleware'); 
// Asumsi: presensiController.upload diakses melalui controller

router.use(authenticateToken); // Semua route di bawah ini butuh login

// [PERBAIKAN KRUSIAL] Tambahkan middleware Multer di sini
// 'image' harus sesuai dengan key FormData yang dikirim dari frontend (PresensiPage.js)
router.post(
    '/check-in', 
    presensiController.upload.single('image'), 
    presensiController.checkIn
);

// Route Check-out tidak memerlukan upload file
router.post('/check-out', presensiController.checkOut);
router.get('/report', presensiController.dailyReport);

// Contoh route admin (jika ada role checking/admin middleware)
// router.put('/:id', isAdmin, presensiController.updatePresensi);
// router.delete('/:id', isAdmin, presensiController.deletePresensi);
// router.get('/report', isAdmin, presensiController.dailyReport);


module.exports = router;