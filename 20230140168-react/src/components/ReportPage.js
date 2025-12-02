
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const url = query 
        ? `http://localhost:3001/api/reports/daily?nama=${query}` 
        : "http://localhost:3001/api/reports/daily";

      const response = await axios.get(url, config);
      
      setReports(response.data.data || []); 
      setError(null);
    } catch (err) {
       if (err.response && err.response.status === 403) {
           setError("Akses ditolak. Anda bukan admin.");
       } else {
           setError("Gagal mengambil laporan.");
       }
    }
  };

  useEffect(() => {
    fetchReports("");
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  // Fungsi helper untuk link Google Maps
  const getMapLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
        Laporan Presensi Harian
      </h1>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cari
        </button>
      </form>

      {error && <p style={{ color: 'red', background: '#fee2e2', padding: '1rem', borderRadius: '4px' }}>{error}</p>}

      {!error && (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Nama</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Check-In</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Check-Out</th>
                {/* Header Dipisah */}
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Latitude</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem 1.5rem', color: '#111827' }}>
                      {presensi.user ? presensi.user.nama : "N/A"}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                      {new Date(presensi.checkIn).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                      {presensi.checkOut
                        ? new Date(presensi.checkOut).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
                        : "Belum Check-Out"}
                    </td>
                    
                    {/* Kolom Latitude Sendiri */}
                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                      {presensi.latitude ? (
                        <a 
                          href={getMapLink(presensi.latitude, presensi.longitude)} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline' }}
                          title="Lihat di Google Maps"
                        >
                          {presensi.latitude}
                        </a>
                      ) : "-"}
                    </td>

                    {/* Kolom Longitude Sendiri */}
                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                      {presensi.longitude ? (
                        <a 
                          href={getMapLink(presensi.latitude, presensi.longitude)} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline' }}
                          title="Lihat di Google Maps"
                        >
                          {presensi.longitude}
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Update colSpan jadi 5 karena kolom bertambah */}
                  <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    Tidak ada data ditemukan.
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
