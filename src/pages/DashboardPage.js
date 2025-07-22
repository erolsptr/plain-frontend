import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

function DashboardPage({ user }) {
  const navigate = useNavigate();
  // YENİ: Kullanıcının girdiği oda kodunu tutmak için state
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = async () => {
    if (!user || !user.name) {
      alert("Oda oluşturmak için kullanıcı bilgisi gerekli. Lütfen tekrar giriş yapın.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Yetkilendirme anahtarı bulunamadı. Lütfen tekrar giriş yapın.");
        return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: user.name }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Oda oluşturulamadı: ${errorData}`);
      }
      
      const newRoom = await response.json();
      navigate(`/room/${newRoom.roomId}`, { state: { user: user } });
    } catch (error) {
      console.error("Oda oluşturma hatası:", error);
      alert(error.message);
    }
  };

  // YENİ: Odaya katılma fonksiyonu
  const handleJoinRoom = (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engelle
    if (!roomCode.trim()) {
      alert("Lütfen geçerli bir oda kodu girin.");
      return;
    }
    // Kullanıcıyı girilen koda sahip odaya yönlendir
    navigate(`/room/${roomCode.trim()}`, { state: { user: user } });
  };
  
  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Kontrol Paneli</h2>
      <p>Hoşgeldin, <strong>{user.name}</strong>!</p>
      
      {/* YENİ: Oda oluşturma ve katılma aksiyonları ayrıldı */}
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
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())} // Kodu otomatik büyük harf yap
              className="room-code-input"
            />
            <button type="submit" className="btn btn-secondary">Katıl</button>
          </form>
        </div>

      </div>

      <div className="past-rooms-section">
        <h3>Geçmiş Odalar</h3>
        <p className="placeholder-text">
          Bu özellik yakında eklenecektir.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;