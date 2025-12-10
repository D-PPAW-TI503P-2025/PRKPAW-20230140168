const { Presensi, User } = require('../models'); // Pastikan 'User' di-import untuk report
const { Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');
const multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator'); // Import jika menggunakan validasi di route

// --- 1. Konfigurasi MULTER untuk Upload Foto ---

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Simpan di folder uploads/
    },
    filename: (req, file, cb) => {
        // Format nama file: userId-timestamp.ext
        // Pastikan req.user.id tersedia (dari middleware auth)
        const userId = req.user ? req.user.id : 'unknown'; 
        cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

// Export Middleware Multer. Ini harus digunakan di file router.
exports.upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
}); 

// --- 2. Controller Functions ---

exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Ambil data dari req.body (dikirim oleh FormData, diproses Multer)
        const { latitude, longitude } = req.body;
        // Ambil path foto dari Multer
        const buktiFoto = req.file ? req.file.path : null;

        // Cek Log! Log ini sangat penting untuk debugging
        console.log("Status req.file:", req.file); 
        console.log("Path Bukti Foto yang akan disimpan:", buktiFoto);
        
        // **PENTING: Cek apakah user sudah Check-In dan BELUM Check-Out**
        const existingPresensi = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (existingPresensi) {
            return res.status(400).json({ message: "Anda sudah Check-In dan belum Check-Out." });
        }
        
        // **Validasi Foto (jika dianggap wajib)**
        if (!buktiFoto) {
             return res.status(400).json({ message: "Gagal Check-In: Bukti foto wajib diunggah." });
        }


        const newPresensi = await Presensi.create({
            userId: userId,
            checkIn: now,
            latitude: latitude,
            longitude: longitude,
            buktiFoto: buktiFoto, // Simpan path foto
            checkOut: null
        });

        return res.status(201).json({ message: "Check-In berhasil", data: newPresensi });
    } catch (error) {
        console.error("CheckIn Error:", error);
        
        // Error handling spesifik untuk Multer
        if (error.code === 'LIMIT_FILE_SIZE') {
             return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
        }
        if (error.message === 'Hanya file gambar yang diperbolehkan!') {
             return res.status(400).json({ message: 'Hanya file gambar yang diperbolehkan!' });
        }
        
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Cari data check-in user yang BELUM checkout
        const presensiToUpdate = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (!presensiToUpdate) { 
             return res.status(404).json({ message: "Anda belum Check-In atau sudah Check-Out hari ini." }); 
        }

        presensiToUpdate.checkOut = now;
        await presensiToUpdate.save();

        return res.json({ message: "Check-Out berhasil", data: presensiToUpdate });
    } catch (error) {
        console.error("CheckOut Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};


// --- 3. Fungsi Admin (dari kode referensi Anda) ---

exports.updatePresensi = async (req, res) => {
    // Diasumsikan validationResult di-import dari express-validator
    // Anda mungkin perlu menambahkan `const { validationResult } = require('express-validator');` di awal file
    // const errors = validationResult(req); 
    // if (!errors.isEmpty()) { return res.status(400).json({ message: "Validasi gagal", errors: errors.array() }); }

    try {
        const presensiId = req.params.id;
        const { checkIn, checkOut } = req.body;

        if (checkIn === undefined && checkOut === undefined) {
            return res.status(400).json({ message: "Request body tidak berisi data yang valid untuk diupdate." });
        }
        const recordToUpdate = await Presensi.findByPk(presensiId);

        if (!recordToUpdate) { return res.status(404).json({ message: "Catatan presensi tidak ditemukan." }); }

        recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
        recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;

        await recordToUpdate.save();
        res.json({ message: "Data presensi berhasil diperbarui.", data: recordToUpdate });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

exports.deletePresensi = async (req, res) => {
    try {
        // Note: Biasanya hanya admin yang bisa menghapus, atau user hanya boleh menghapus miliknya sendiri.
        // Di sini saya asumsikan hanya admin/pemilik yang bisa.
        const { id: userId } = req.user; 
        const presensiId = req.params.id;

        const recordToDelete = await Presensi.findByPk(presensiId);

        if (!recordToDelete) { return res.status(404).json({ message: "Catatan presensi tidak ditemukan." }); }

        // Batasi hanya user/pemilik record yang bisa menghapus (opsional: tambahkan isAdmin check)
        // if (recordToDelete.userId !== userId) { return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." }); }

        await recordToDelete.destroy();
        res.status(204).send(); // 204 No Content

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

exports.dailyReport = async (req, res) => {
    try {
        const { nama, tanggalMulai, tanggalSelesai } = req.query;

        let options = {
            where: {},
            order: [['checkIn', 'DESC']],
            include: [{
                model: User,
                attributes: ['nama'],
                required: false,
                as: 'user',
                where: {}
            }]
        };

        if (nama && nama.length > 0) {
            options.include[0].where.nama = { [Op.like]: `%${nama}%` };
        } else {
            options.include[0].where = {};
        }

        if (tanggalMulai && tanggalSelesai) {
            const startDate = new Date(tanggalMulai);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(tanggalSelesai);
            endDate.setHours(23, 59, 59, 999);

            options.where.checkIn = { [Op.between]: [startDate, endDate] };
        }

        const records = await Presensi.findAll(options);

        res.json(records);

    } catch (error) {
        console.error("REPORT ERROR:", error);
        res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
    }
};