import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

// Henüz oluşturmadığımız ama birazdan oluşturacağımız yeni sayfalar/component'ler
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Room from './pages/Room'; // Room component'ini de 'pages' klasörüne taşıyacağız.
import Navbar from './components/Navbar'; // Tüm sayfalarda görünecek bir navigasyon barı

function App() {
  // Uygulamanın en temel state'i: Giriş yapmış bir kullanıcı var mı?
  // localStorage'dan başlangıç değerini almayı deneyebiliriz, bu sayfa yenilemede login'i korur.
  const [currentUser, setCurrentUser] = useState(null);

  // Bu fonksiyonlar, Login ve Register sayfalarından çağrılacak.
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    // JWT'yi localStorage'a kaydetme mantığı buraya gelecek.
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // JWT'yi localStorage'dan silme mantığı buraya gelecek.
  };

  return (
    <div className="App">
      {/* Navbar, tüm sayfalarda ortak olarak görünecek. */}
      {/* Kullanıcının login durumuna göre farklı butonlar gösterebilir. */}
      <Navbar user={currentUser} onLogout={handleLogout} />
      
      <main className="app-content">
        <Routes>
          {/* Herkesin erişebileceği yollar */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          
          {/* Sadece giriş yapmış kullanıcıların erişebileceği yollar */}
          {/* İleride "Protected Route" mantığı ile daha güvenli hale getireceğiz. */}
          <Route path="/dashboard" element={<DashboardPage user={currentUser} />} />
          <Route path="/room/:roomId" element={<Room user={currentUser} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;