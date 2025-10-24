const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.getDailyReport = async (req, res) => { // 2. Tambahkan async
  console.log("Controller: Mengambil data laporan harian dari database...");

  // 3. Gunakan try...catch untuk error handling
  try {
    // 4. Ganti cara mengambil data menggunakan 'findAll' dari Sequelize
    //    Kita urutkan berdasarkan checkIn terbaru (DESC)
    const allRecords = await Presensi.findAll({
      order: [["checkIn", "DESC"]],
    });

    // 5. (Opsional tapi disarankan) Format data agar konsisten
    const formattedData = allRecords.map((record) => ({
      userId: record.userId,
      nama: record.nama,
      checkIn: record.checkIn
        ? format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
      checkOut: record.checkOut
        ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
    }));

    res.json({
      reportDate: format(new Date(), "yyyy-MM-dd", { timeZone }), // Format tanggal laporan
      data: formattedData, // Kirim data yang sudah diformat
    });
    
  } catch (error) {
    // 6. Tambahkan error handling
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};