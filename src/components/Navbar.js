import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Bu dosyayı birazdan oluşturacağız.

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    // App.js'e çıkış yapma isteğini iletiyoruz.
    onLogout();
    // Kullanıcıyı ana sayfaya yönlendiriyoruz.
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          plAIn 🤖
        </Link>
        <ul className="navbar-menu">
          {user ? (
            // Kullanıcı giriş yapmışsa gösterilecekler
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
            // Kullanıcı giriş yapmamışsa gösterilecekler
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