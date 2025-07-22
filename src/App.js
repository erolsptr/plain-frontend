import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Room from './pages/Room';
import Navbar from './components/Navbar';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authIsReady, setAuthIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // JWT'nin payload kısmını (ortadaki) decode et
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Token'ın son kullanma tarihini kontrol et (saniye cinsinden)
        if (payload.exp * 1000 > Date.now()) {
          // Token geçerliyse, kullanıcıyı state'e set et
          const user = { 
            email: payload.sub, // 'sub' genellikle email'i tutar
            name: payload.name || payload.sub.split('@')[0] // 'name' claim'i varsa onu, yoksa email'in başını kullan
          };
          setCurrentUser(user);
        } else {
          // Token'ın süresi dolmuşsa, localStorage'dan sil
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error("Token parse edilemedi veya geçersiz:", e);
        localStorage.removeItem('token');
      }
    }
    // Auth kontrolü her durumda bitti
    setAuthIsReady(true);
  }, []);

  const handleLogin = (user, token) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  if (!authIsReady) {
    return <div className="loading-screen">Yükleniyor...</div>;
  }

  return (
    <div className="App">
      <Navbar user={currentUser} onLogout={handleLogout} />
      
      <main className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          
          <Route path="/dashboard" element={<DashboardPage user={currentUser} />} />
          <Route path="/room/:roomId" element={<Room user={currentUser} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;