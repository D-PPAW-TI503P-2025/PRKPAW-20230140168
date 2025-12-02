import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Fix Icon Marker Leaflet ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null); // Koordinat Live
  const [recordedCoords, setRecordedCoords] = useState(null); // Koordinat saat tombol ditekan

  const getToken = () => localStorage.getItem("token");

  // --- Fungsi Ambil Lokasi ---
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // --- Handle Check-In ---
  const handleCheckIn = async () => {
    setMessage(""); 
    setError("");
    setRecordedCoords(null); // Reset info rekaman sebelumnya
    
    if (!coords) {
        setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi browser.");
        return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` },
      };
      
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        {
            latitude: coords.lat,
            longitude: coords.lng
        }, 
        config
      );
      setMessage(response.data.message);
      setRecordedCoords(coords); // Simpan koordinat yang berhasil dikirim untuk ditampilkan
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-in gagal");
    }
  };

  // --- Handle Check-Out ---
  const handleCheckOut = async () => {
    setMessage(""); 
    setError("");
    setRecordedCoords(null);

    // Opsional: Kirim lokasi juga saat checkout jika backend mendukung
    // Untuk saat ini kita pakai coords untuk display saja
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` },
      };
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {}, 
        config
      );
      setMessage(response.data.message);
      // Tampilkan lokasi saat checkout dilakukan (meski backend mungkin tidak simpan, info ini berguna buat user)
      if(coords) setRecordedCoords(coords); 
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-out gagal");
    }
  };

  // --- Styles (Inline CSS) ---
  const styles = {
    container: {
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px', 
        paddingBottom: '50px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
        width: '600px',
        overflow: 'hidden'
    },
    header: {
        background: '#2563eb', // Biru Header
        padding: '1.5rem',
        textAlign: 'center',
        color: 'white'
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '600'
    },
    body: {
        padding: '2rem'
    },
    infoBox: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: '#475569'
    },
    mapContainer: {
        height: '400px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden',
        marginBottom: '1.5rem',
        border: '2px solid #e2e8f0'
    },
    btnGroup: {
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center'
    },
    btn: {
        padding: '0.8rem 2rem',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    btnCheckIn: {
        background: '#16a34a', // Hijau
        color: 'white',
    },
    btnCheckOut: {
        background: '#dc2626', // Merah
        color: 'white',
    },
    btnDisabled: {
        background: '#cbd5e1',
        color: '#64748b',
        cursor: 'not-allowed'
    },
    messageSuccess: {
        padding: '1rem',
        background: '#dcfce7',
        color: '#166534',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #bbf7d0'
    },
    messageError: {
        padding: '1rem',
        background: '#fee2e2',
        color: '#991b1b',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #fecaca'
    },
    coordDetails: {
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Card */}
        <div style={styles.header}>
            <h2 style={styles.headerTitle}>📍 Presensi Lokasi</h2>
            <p style={{margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem'}}>Pastikan lokasi Anda akurat sebelum Check-In</p>
        </div>

        <div style={styles.body}>
            {/* Pesan Error / Sukses */}
            {message && (
                <div style={styles.messageSuccess}>
                    <strong>✅ Berhasil!</strong> <br/>
                    {message}
                    {/* Tampilkan Koordinat yang Terekam */}
                    {recordedCoords && (
                        <div style={styles.coordDetails}>
                            Lokasi Terekam: Lat {recordedCoords.lat.toFixed(6)}, Lng {recordedCoords.lng.toFixed(6)}
                        </div>
                    )}
                </div>
            )}
            
            {error && (
                <div style={styles.messageError}>
                    <strong>❌ Terjadi Kesalahan!</strong> <br/>
                    {error}
                </div>
            )}

            {/* Info Box Koordinat Live */}
            <div style={styles.infoBox}>
                <strong>Lokasi Anda Saat Ini:</strong> <br/>
                {coords ? (
                    <span>Latitude: {coords.lat.toFixed(6)} | Longitude: {coords.lng.toFixed(6)}</span>
                ) : (
                    <span>Sedang mencari sinyal GPS... 🛰️</span>
                )}
            </div>

            {/* Peta */}
            {coords ? (
                <div style={styles.mapContainer}>
                    <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={[coords.lat, coords.lng]}>
                            <Popup>Posisi Anda Saat Ini</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            ) : (
                <div style={{...styles.mapContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9'}}>
                    <p>Peta akan muncul setelah lokasi ditemukan...</p>
                </div>
            )}
            
            {/* Tombol Aksi */}
            <div style={styles.btnGroup}>
                <button 
                    onClick={handleCheckIn} 
                    disabled={!coords}
                    style={{
                        ...styles.btn, 
                        ...(coords ? styles.btnCheckIn : styles.btnDisabled)
                    }}
                >
                    📥 Check-In
                </button>
                
                <button 
                    onClick={handleCheckOut} 
                    style={{...styles.btn, ...styles.btnCheckOut}}
                >
                    📤 Check-Out
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;