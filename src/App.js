import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Room from './pages/Room';
import Navbar from './components/Navbar';

function App() {
  // currentUser state'i artık her zaman null olarak başlar.
  const [currentUser, setCurrentUser] = useState(null);

  // Otomatik giriş (auto-login) mantığı tamamen kaldırıldı.
  // useEffect(() => { ... }, []);

  const handleLogin = (user, token) => {
    // Artık token'ı localStorage'a kaydetmiyoruz.
    // Sadece o anki oturum için kullanıcıyı state'e set ediyoruz.
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // localStorage'dan silinecek bir token yok.
    // Sadece kullanıcıyı state'ten kaldırıyoruz.
    setCurrentUser(null);
  };

  // "authIsReady" kontrolüne artık ihtiyaç yok.
  // if (!authIsReady) { ... }

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