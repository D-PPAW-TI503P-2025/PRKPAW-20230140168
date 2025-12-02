import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css'; // <--- WAJIB ADA!
// Import komponen
import Navbar from './components/Navbar'; 
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import PresensiPage from './components/PresensiPage'; 
import ReportPage from './components/ReportPage'; 

function App() {
  return (
    <BrowserRouter>
      {/* Navbar diletakkan di sini agar muncul di semua halaman */}
      <Navbar /> 
      
      <Routes>
        {/* Redirect root ke login */}
        <Route path="/" element={<Navigate replace to="/login" />} />
        
        {/* Route Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Route Fitur */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/reports" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;