// controllers/reportController.js

// 1. Impor Model Presensi dan Operator Sequelize
const { Presensi } = require("../models");
const { Op } = require("sequelize");


// 2. Implementasi getDailyReport dengan filter Nama dan Rentang Tanggal
exports.getDailyReport = async (req, res) => {
  try {
    // Ambil query parameters: nama, tanggalMulai, dan tanggalSelesai [cite: 110, 131]
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { where: {} };

    // Filter berdasarkan Nama (jika ada) [cite: 112]
    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`, // Mencari nama yang mengandung string tertentu [cite: 114]
      };
    }

    // Filter berdasarkan Rentang Tanggal (Tugas Modul) 
    if (tanggalMulai && tanggalSelesai) {
      // Asumsi memfilter berdasarkan waktu dibuatnya record ('createdAt').
      // Perlu dipastikan format tanggal yang dikirim dari query parameters
      // sudah sesuai dengan format database.
      options.where.createdAt = {
        [Op.between]: [tanggalMulai, tanggalSelesai], // Menggunakan [Op.between] untuk rentang tanggal 
      };
    }

    // Lakukan query ke database
    const records = await Presensi.findAll(options); // Mengambil semua data dengan opsi filter [cite: 117]

    // Kirimkan respon berhasil
    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
    } catch (error) {
    // Kirimkan respon error server
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};