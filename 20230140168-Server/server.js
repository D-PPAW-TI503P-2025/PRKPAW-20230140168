const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/books'); // Impor rute buku

const app = express();
const PORT = 3001;

// Middleware Bawaan
app.use(cors());
app.use(express.json()); // Body parser untuk JSON

// 1. Logging Middleware (Sesuai permintaan tugas)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // Lanjutkan ke middleware atau route handler berikutnya
});

// Routes
app.get('/', (req, res) => {
  res.send('Home Page for Library API');
});

// Menggunakan API router untuk buku
app.use('/api/books', bookRoutes);

// 2. 404 Not Found Handler (Middleware untuk menangani route yang tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// 3. Global Error Handler (Middleware untuk menangani error internal server)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});