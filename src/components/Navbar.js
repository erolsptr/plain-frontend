import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

import logo from '../assets/logo.png'; 

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* --- BU BÖLÜM DEĞİŞTİRİLDİ --- */}
        <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
          {/* Eğer kullanıcı varsa /dashboard'a, yoksa /'a yönlendir */}
          <img src={logo} alt="plAIn Logo" className="navbar-logo-img" />
        </Link>
        {/* --- DEĞİŞİKLİK SONU --- */}
        <ul className="navbar-menu">
          {user ? (
            <>
              <li className="navbar-item">
                <span className="navbar-user-greeting">Hoşgeldin, {user.name}!</span>
              </li>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-links">
                  Kontrol Paneli
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogoutClick} className="navbar-button">
                  Çıkış Yap
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-links">
                  Giriş Yap
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-links btn-register">
                  Kayıt Ol
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;