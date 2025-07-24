import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './DashboardPage.css';

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation(); // Sayfa konumu değişikliklerini dinlemek için
  const [roomCode, setRoomCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bu useEffect, user bilgisi geldiğinde VEYA sayfaya geri dönüldüğünde çalışır.
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Odalar sunucudan alınamadı.');
        }
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Odaları çekerken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
        fetchRooms();
    }
  }, [user, location]); // location'ı bağımlılık olarak eklemek, geri tuşuna basıldığında listeyi günceller.

  const handleCreateRoom = async () => {
    if (!user || !user.name) {
      alert("Oda oluşturmak için kullanıcı bilgisi gerekli.");
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Yetkilendirme anahtarı bulunamadı.");
        return;
    }
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Oda oluşturulamadı: ${errorData}`);
      }
      const newRoom = await response.json();
      navigate(`/room/${newRoom.roomId}`, { state: { user: user, isNewRoom: true } });
    } catch (error) {
      console.error("Oda oluşturma hatası:", error);
      alert(error.message);
    }
  };
  
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      alert("Lütfen geçerli bir oda kodu girin.");
      return;
    }
    navigate(`/room/${roomCode.trim().toUpperCase()}`, { state: { user: user } });
  };
  
  if (!user) {
    return <div className="loading-screen">Kullanıcı bilgisi bekleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Kontrol Paneli</h2>
      <p>Hoşgeldin, <strong>{user.name}</strong>!</p>
      
      <div className="dashboard-actions-grid">
        <div className="action-card">
          <h3>Yeni Oda Oluştur</h3>
          <p>Yeni bir oylama oturumu başlatmak için butona tıkla.</p>
          <button onClick={handleCreateRoom} className="btn btn-primary">
            Oda Oluştur
          </button>
        </div>
        <div className="action-card">
          <h3>Bir Odaya Katıl</h3>
          <p>Mevcut bir odaya katılmak için oda kodunu gir.</p>
          <form onSubmit={handleJoinRoom} className="join-room-form">
            <input 
              type="text" 
              placeholder="Oda Kodu"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="room-code-input"
            />
            <button type="submit" className="btn btn-secondary">Katıl</button>
          </form>
        </div>
      </div>

      <div className="past-rooms-section">
        <h3>Geçmiş Odalar</h3>
        {isLoading ? (
          <p className="placeholder-text">Odalar yükleniyor...</p>
        ) : rooms.length > 0 ? (
          // DÜZELTİLDİ: Buradaki JSX yapısı, CSS'in doğru çalışması için kesin hali.
          <div className="rooms-grid">
            {rooms.map(room => (
              <Link to={`/room/${room.roomId}`} state={{ user: user }} key={room.roomId} className="room-card-link">
                <div className="room-card">
                  <div className="room-card-id">{room.roomId}</div>
                  <div className="room-card-info">
                    <span>Sahip: <strong>{room.ownerName}</strong></span>
                    <span>{room.taskCount} görev</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="placeholder-text">
            Henüz katıldığınız veya oluşturduğunuz bir oda bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;