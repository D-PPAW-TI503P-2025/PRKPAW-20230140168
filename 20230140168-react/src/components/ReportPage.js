import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportPage() {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // --- Konfigurasi URL dan Waktu (Menggunakan Port 3001 Sesuai Konfirmasi) ---
    
    const BASE_URL = "http://localhost:3001/"; 
    // Pastikan route ini sesuai dengan yang Anda definisikan di routes/presensi.js
    // Contoh: router.get('/reports/daily', presensiController.dailyReport);
    const API_REPORTS_URL = `${BASE_URL}api/presensi/report`; // Asumsi endpoint report adalah '/api/presensi/report'
    
    const TIMEZONE = "Asia/Jakarta";

    // Opsi waktu lengkap untuk format WIB yang konsisten
    const TIMEZONE_OPTIONS_FULL = { 
        timeZone: TIMEZONE, 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    };


    const fetchReports = async (query = "") => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            
            // Buat URL dengan query parameter nama
            const url = `${API_REPORTS_URL}?nama=${query}`; 

            const response = await axios.get(url, config); 
            
            // Cek apakah response.data adalah array
            if (Array.isArray(response.data)) {
                 setReports(response.data); 
            } else {
                 console.error("Data yang diterima bukan array:", response.data);
                 setError("Format data dari server tidak valid.");
                 setReports([]);
            }
           
            setError(null); 
            console.log("Data Laporan Diterima:", response.data); 

        } catch (err) {
            // Log error detail untuk debugging
            console.error("Fetch Reports Error Detail:", err); 
            const msg = err.response 
                ? `Error ${err.response.status}: ${err.response.data.message || 'Akses Ditolak/Server Error'}` 
                : "Gagal memuat laporan. Cek koneksi server.";
            setError(msg);
            setReports([]); // Kosongkan laporan jika error
        }
    };

    useEffect(() => {
        // Panggil fetchReports saat komponen dimuat
        fetchReports(""); 
    }, []); 
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchReports(searchTerm);
    };
    
    // Helper untuk memformat waktu
    const formatTime = (time) => {
        if (!time) return "Belum Check-Out";
        try {
            return new Date(time).toLocaleString("id-ID", TIMEZONE_OPTIONS_FULL); 
        } catch (e) {
            return "Waktu Invalid";
        }
    };
    
    // Helper untuk membuat URL foto yang benar
    const getPhotoUrl = (path) => {
        if (!path) return null;
        // Normalisasi path: Mengganti backslash (dari Windows path) menjadi forward slash
        const normalizedPath = path.replace(/\\/g, '/'); 
        
        // Menggabungkan BASE_URL dan normalizedPath (Contoh: http://localhost:3001/uploads/user-1234.jpg)
        return `${BASE_URL}${normalizedPath}`; 
    };


    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Laporan Presensi Harian
            </h1>

            <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
                >
                    Cari
                </button>
            </form>

            {error && (
                <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">
                    **Gagal Memuat Data:** {error}
                </p>
            )}

            {!error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti Foto</th> 
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.length > 0 ? (
                                reports.map((presensi) => {
                                    // Pastikan objek 'User' dan 'buktiFoto' ada
                                    const photoUrl = getPhotoUrl(presensi.buktiFoto);
                                    
                                    return (
                                        <tr key={presensi.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {presensi.user ? presensi.user.nama : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatTime(presensi.checkIn)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatTime(presensi.checkOut)}
                                            </td>
                                            
                                            {/* Kolom Lokasi (Gabungan Latitude & Longitude) */}
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {presensi.latitude && presensi.longitude
                                                    ? `Lat: ${String(presensi.latitude).substring(0, 8)}... | Lng: ${String(presensi.longitude).substring(0, 8)}...`
                                                    : 'N/A'}
                                            </td>

                                            {/* Kolom Bukti Foto (Thumbnail) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {photoUrl ? (
                                                    <a href={photoUrl} target="_blank" rel="noopener noreferrer">
                                                        <img 
                                                            src={photoUrl} 
                                                            alt="Bukti Selfie" 
                                                            // Menggunakan object-fit cover agar gambar 50x50px terisi penuh
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                                                        />
                                                    </a>
                                                ) : (
                                                    "Tidak Ada Foto"
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada data laporan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReportPage;