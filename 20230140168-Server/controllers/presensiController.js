const { Presensi } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');

exports.CheckIn = async (req, res) => {
  try {
    // Ambil userId dari token (bukan dari body)
    const userId = req.user.id; 
    const now = new Date();
    const { latitude, longitude } = req.body; 

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Cek apakah sudah check-in hari ini
    const existingCheckIn = await Presensi.findOne({
      where: {
        userId: userId,
        checkIn: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: 'Anda sudah melakukan check-in hari ini.' });
    }

    // Simpan data (tanpa kolom nama)
    const newPresensi = await Presensi.create({
      userId: userId,
      checkIn: now,
      latitude: latitude, // <-- Simpan ke database
      longitude: longitude, 
      checkOut: null,
      
    });

    res.status(201).json({
      message: 'Check-in berhasil',
      data: newPresensi
    });

  } catch (error) {
    console.error("Error CheckIn:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari token
    const now = new Date();

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Cari data check-in user hari ini yang belum checkout
    const checkInData = await Presensi.findOne({
      where: {
        userId: userId,
        checkOut: null,
        checkIn: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    if (!checkInData) {
      return res.status(400).json({ message: 'Anda belum melakukan check-in hari ini atau sudah check-out.' });
    }

    checkInData.checkOut = now;
    await checkInData.save();

    res.status(200).json({
      message: 'Check-out berhasil',
      data: checkInData
    });

  } catch (error) {
    console.error("Error CheckOut:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};