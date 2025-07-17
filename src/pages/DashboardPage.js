import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css'; // Bu dosyayı birazdan oluşturacağız.

// Bu component, App.js'ten giriş yapmış olan kullanıcı bilgisini (user) prop olarak alacak.
function DashboardPage({ user }) {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    // Bu fonksiyon, App.js'de tanımladığımız createRoom fonksiyonuna çok benziyor.
    // Ancak artık kullanıcı bilgisini prop'tan alıyoruz.
    if (!user || !user.name) {
      alert("Oda oluşturmak için kullanıcı bilgisi gerekli. Lütfen tekrar giriş yapın.");
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name }),
      });

      if (!response.ok) {
        throw new Error('Sunucudan oda oluşturma hatası alındı.');
      }
      
      const newRoom = await response.json(); // Cevap: { roomId: 'ABC123' }

      // Kullanıcıyı yeni odanın URL'sine yönlendirirken,
      // mevcut kullanıcı bilgisini de state olarak taşıyoruz.
      navigate(`/room/${newRoom.roomId}`, { state: { user: user } });

    } catch (error) {
      console.error("Oda oluşturma hatası:", error);
    }
  };
  
  // Eğer bir şekilde bu sayfaya kullanıcı bilgisi olmadan gelinirse,
  // bir yükleme ekranı veya hata mesajı göster.
  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Kontrol Paneli</h2>
      <p>Hoşgeldin, <strong>{user.name}</strong>!</p>
      
      <div className="dashboard-actions">
        <button onClick={handleCreateRoom} className="btn btn-primary">
          Yeni Bir Oda Oluştur
        </button>
      </div>

      <div className="past-rooms-section">
        <h3>Geçmiş Odalar</h3>
        <p className="placeholder-text">
          Bu özellik yakında eklenecektir. Daha önce katıldığınız veya
          oluşturduğunuz odaların bir listesini burada görebileceksiniz.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;