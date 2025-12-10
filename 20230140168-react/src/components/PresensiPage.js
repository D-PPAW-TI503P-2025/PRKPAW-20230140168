import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Webcam from 'react-webcam'; // Import Webcam

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

// URL API dan Opsi Waktu
const API_URL = "http://localhost:3001/api/presensi"; // Ganti dengan port yang benar (5000 atau 3001)
const TIMEZONE_OPTIONS_FULL = { 
    timeZone: 'Asia/Jakarta', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
};

function PresensiPage() {
    const navigate = useNavigate();

    // State Presensi & Pesan
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [checkInTime, setCheckInTime] = useState(null); 
    const [checkOutTime, setCheckOutTime] = useState(null); 
    
    // State Lokasi
    const [coords, setCoords] = useState(null); // {lat, lng} - Lokasi Live
    const [recordedCoords, setRecordedCoords] = useState(null); // Koordinat saat Check-in/out berhasil
    const [locationError, setLocationError] = useState(null); 
    
    // State Kamera
    const [image, setImage] = useState(null); // State Base64 foto
    const webcamRef = useRef(null); // Ref untuk akses kamera
    
    // --- Helper Functions ---
    const getToken = () => localStorage.getItem("token");

    const createConfig = () => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return null;
        }
        return {
            headers: { Authorization: `Bearer ${token}` },
        };
    };

    // [Geolocation] Logic Geolocation
    const getLocation = () => {
        setLocationError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({ 
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    setLocationError("Gagal mendapatkan lokasi: " + err.message);
                }
            );
        } else {
            setLocationError("Geolocation tidak didukung oleh browser ini.");
        }
    };
    
    useEffect(() => { 
        getLocation();
    }, []); 
    
    // [Webcam] Logic Capture Foto
    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImage(imageSrc); // Menyimpan Base64 string
        }
    }, [webcamRef]);
    
    // [Check-In dengan Foto] Handle Check-In (Kirim FormData)
    const handleCheckIn = async () => {
        if (!coords) {
            setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi."); 
            return;
        }
        if (!image) { // Foto wajib ada
            setError("Foto selfie wajib diambil sebelum Check-In.");
            return;
        }

        const token = getToken();
        if (!token) {
             navigate("/login");
             return;
        }

        setError('');
        setMessage('');
        setCheckOutTime(null);
        setCheckInTime(null); 
        setRecordedCoords(null);

        try {
            // 1. Konversi Base64 menjadi Blob
            const blob = await (await fetch(image)).blob();

            // 2. Buat FormData
            const formData = new FormData();
            formData.append('latitude', String(coords.lat)); 
            formData.append('longitude', String(coords.lng));
            formData.append('image', blob, 'selfie.jpeg'); // Key 'image' harus sesuai Multer di backend!

            // 3. Kirim FormData
            const response = await axios.post(
                `${API_URL}/check-in`, 
                formData, 
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        // Biarkan Axios mengatur Content-Type: multipart/form-data
                    } 
                }
            );
            
            const data = response.data.data;
            setMessage(response.data.message);
            setImage(null); // Reset foto setelah sukses
            setRecordedCoords(coords); // Simpan koordinat yang berhasil dikirim

            if (data && data.checkIn) {
                setCheckInTime(new Date(data.checkIn));
            }

        } catch (err) {
            console.error("Check-in Error:", err);
            setError(err.response ? err.response.data.message : "Check-in gagal. Cek konsol browser/server.");
        }
    };

    // [Fungsi Check-Out]
    const handleCheckOut = async () => {
        const config = createConfig();
        if (!config) return;

        setError("");
        setMessage("");
        setCheckInTime(null);
        setCheckOutTime(null); 
        setRecordedCoords(null);

        try {
            const response = await axios.post(`${API_URL}/check-out`, {}, config);
            const data = response.data.data;

            setMessage(response.data.message);
            if(coords) setRecordedCoords(coords); 

            if (data && data.checkOut) {
                setCheckOutTime(new Date(data.checkOut));
            }

        } catch (err) {
            setError(err.response ? err.response.data.message : "Check-out gagal");
        }
    };

    // --- Styles (Inline CSS) --- (Disertakan dari kode yang Anda kirim)
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
      webcamContainer: {
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          background: '#000',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
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
          transition: 'background 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flex: 1, // Agar tombol Check-in/out berbagi lebar
          justifyContent: 'center'
      },
      btnAction: {
          padding: '0.8rem 2rem',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          justifyContent: 'center'
      },
      btnCamera: {
          background: '#2563eb', // Biru untuk Kamera
          color: 'white',
          marginBottom: '1rem'
      },
      btnReCapture: {
          background: '#64748b', // Abu-abu untuk Foto Ulang
          color: 'white',
          marginBottom: '1rem'
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
                    <h2 style={styles.headerTitle}>📸 Presensi Digital (Lokasi & Selfie)</h2>
                    <p style={{margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem'}}>Lokasi dan foto wajib diunggah saat Check-In</p>
                </div>

                <div style={styles.body}>
                    {/* Pesan Error / Sukses */}
                    {message && (
                        <div style={styles.messageSuccess}>
                            <strong>✅ Berhasil!</strong> <br/>
                            {message}
                            
                            {checkInTime && (
                                <p style={styles.coordDetails}>
                                    Waktu Check-In Anda: {checkInTime.toLocaleString('id-ID', TIMEZONE_OPTIONS_FULL)}
                                </p>
                            )}
                            {checkOutTime && (
                                <p style={styles.coordDetails}>
                                    Waktu Check-Out Anda: {checkOutTime.toLocaleString('id-ID', TIMEZONE_OPTIONS_FULL)}
                                </p>
                            )}

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
                    {locationError && (
                        <p style={{...styles.messageError, background: '#fffbeb', color: '#a16207', border: '1px solid #fcd34d'}}>
                            {locationError}
                        </p>
                    )}

                    {/* [Webcam/Foto Preview] */}
                    <div style={styles.webcamContainer}>
                        {image ? (
                            <img src={image} alt="Selfie Presensi" style={{width: '100%', display: 'block'}} />
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    width: 600,
                                    height: 400,
                                    facingMode: "user" // Menggunakan kamera depan
                                }}
                                style={{height: '400px', width: '100%'}}
                            />
                        )}
                    </div>
                    
                    {/* Tombol Ambil/Foto Ulang */}
                    <div style={{marginBottom: '1rem'}}>
                        {!image ? (
                            <button onClick={capture} style={{...styles.btnAction, ...styles.btnCamera}}>
                                Ambil Foto 📸
                            </button>
                        ) : (
                            <button onClick={() => setImage(null)} style={{...styles.btnAction, ...styles.btnReCapture}}>
                                Foto Ulang 🔄
                            </button>
                        )}
                    </div>

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
                    
                    {/* Tombol Aksi Check-in/out Utama */}
                    <div style={styles.btnGroup}>
                        <button 
                            onClick={handleCheckIn} 
                            disabled={!coords || !image} // Disabled jika lokasi atau foto belum ada
                            style={{
                                ...styles.btn, 
                                ...((coords && image) ? styles.btnCheckIn : styles.btnDisabled)
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