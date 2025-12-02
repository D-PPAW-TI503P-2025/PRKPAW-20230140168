// controllers/reportController.js

// 1. Impor Model Presensi, User, dan Operator Sequelize
const { Presensi, User } = require("../models"); // 🟢 PERBAIKAN: Impor Model User
const { Op } = require("sequelize");

// 2. Implementasi getDailyReport dengan filter Nama dan Rentang Tanggal
exports.getDailyReport = async (req, res) => {
  try {
    // Ambil query parameters
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    
    // Siapkan objek where untuk Presensi dan User
    let presensiWhere = {};
    let userWhere = {}; // 🟢 WHERE clause khusus untuk Model User

    // 🟢 PERBAIKAN FILTER NAMA (Harus diterapkan ke Model User)
    if (nama) {
      userWhere.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    // Filter berdasarkan Rentang Tanggal (terhadap createdAt)
    if (tanggalMulai && tanggalSelesai) {
      // Menggunakan [Op.between] pada kolom 'createdAt' Presensi
      presensiWhere.createdAt = {
        [Op.between]: [tanggalMulai, tanggalSelesai],
      };
    }

    // 🟢 PERBAIKAN: Gunakan properti 'include' untuk mengambil data User
    const options = {
      where: presensiWhere,
      include: [
        {
          model: User, // Model yang akan di-join
          as: 'user',  // Alias yang sesuai dengan models/presensi.js
          where: userWhere, // 🟢 Terapkan filter nama di sini
          attributes: ['nama', 'email'], // Kolom User yang ingin diambil
          required: !!nama // Set required: true jika ada filter nama agar hanya mengambil record yang punya user
        }
      ]
    };

    // Lakukan query ke database
    const records = await Presensi.findAll(options);

    // Kirimkan respon berhasil
    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    // Kirimkan respon error server
    console.error("Error fetching daily report:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};