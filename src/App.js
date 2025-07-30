import React, { useState } from 'react'; // useEffect'e artık burada gerek yok
import { Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Room from './pages/Room';
import Navbar from './components/Navbar';
// --- YENİ "NÖBETÇİLERİ" IMPORT ET ---
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
// --- IMPORT SONU ---

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (user, token) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <div className="App">
      <Navbar user={currentUser} onLogout={handleLogout} />
      
      <main className="app-content">
        {/* --- ROUTES BLOĞU TAMAMEN YENİLENDİ --- */}
        <Routes>
          {/* Sadece halka açık rotalar */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute user={currentUser}>
                <RegisterPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute user={currentUser}>
                <LoginPage onLogin={handleLogin} />
              </PublicOnlyRoute>
            } 
          />
          
          {/* Korumalı rotalar (giriş yapmayı gerektiren) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={currentUser}>
                <DashboardPage user={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              <ProtectedRoute user={currentUser}>
                <Room user={currentUser} />
              </ProtectedRoute>
            } 
          />
        </Routes>
        {/* --- YENİLEME SONU --- */}
      </main>
    </div>
  );
}

export default App;