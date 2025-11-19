// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Pengguna');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.nama) {
        setUserName(payload.nama);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center h-screen overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-blue-600 p-5">
      <div className="relative z-20 bg-white py-12 px-12 rounded-2xl shadow-2xl w-full max-w-lg animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Selamat Datang!</h1>
          {userName && (
            <p className="text-xl text-gray-700 font-medium">{userName}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Anda berhasil masuk ke sistem</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-6 py-3.5 text-base font-semibold text-white rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Keluar dari Akun
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
