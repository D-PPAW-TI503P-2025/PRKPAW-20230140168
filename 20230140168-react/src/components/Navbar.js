import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token); // Decode token untuk dapat data user
    } catch (e) {
      console.error("Token invalid");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
// Hapus atau set marginBottom jadi 0
  <nav style={{ background: '#2563eb', padding: '1rem', color: 'white', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>App Presensi</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontWeight: 'bold' }}>Halo, {user.nama}</span>
              <Link to="/presensi" style={{ color: 'white', textDecoration: 'none' }}>Presensi</Link>
              {/* Menu Admin hanya muncul jika role admin */}
              {user.role === 'admin' && (
                <Link to="/reports" style={{ color: 'white', textDecoration: 'none' }}>Laporan Admin</Link>
              )}
              <button 
                onClick={handleLogout} 
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

