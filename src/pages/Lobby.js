// Düzeltilmiş Lobby.js

import React, { useState } from 'react';
// useNavigate ve useEffect artık burada kullanılmayacak.

function Lobby({ onRoomCreated }) { // onRoomCreated prop'u App.js'ten geliyor.
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!name) {
      setError('Oda oluşturmak için bir isim girmelisiniz.');
      return;
    }
    setError('');
    // Backend'e oda oluşturma isteği göndermemiz gerekecek.
    // Şimdilik, sadece App.js'e "yeni bir oda isteniyor" bilgisini gönderiyoruz.
    onRoomCreated({ name }); // Sadece kullanıcı adını gönderiyoruz, oda ID'sini backend üretecek.
  };

  return (
    <div className="lobby-container">
      <h2>Odaya Hoşgeldin!</h2>
      <p>Yeni bir oda oluşturmak için ismini gir ve butona tıkla.</p>
      <div className="lobby-form">
        <input
          type="text"
          placeholder="İsminiz"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Oda Oluştur</button>
      </div>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default Lobby;