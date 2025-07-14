// Nihai ve Doğru App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import './App.css';
import Lobby from './Lobby';
import Room from './Room';

const SOCKET_URL = 'http://localhost:8080/ws-poker';

function App() {
  const navigate = useNavigate();
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Bu useEffect, uygulama ilk açıldığında SADECE BİR KEZ çalışır
  // ve WebSocket bağlantısını kurar.
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      onConnect: () => {
        console.log('WebSocket Bağlantısı Kuruldu!');
        setIsConnected(true);
        setStompClient(client);
      },
      onStompError: (frame) => console.error('STOMP Hatası:', frame),
    });
    
    client.activate();

    // Uygulama kapandığında bağlantıyı kes
    return () => {
      if (client.connected) client.deactivate();
    };
  }, []); // Boş bağımlılık dizisi, sadece bir kez çalışmasını sağlar.

  // Bu fonksiyon, Lobby'den tetiklenecek.
  const createRoom = async (userData) => {
    // Backend'e REST API isteği ile oda oluştur.
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name }),
      });
      if (!response.ok) throw new Error('Oda oluşturulamadı.');
      
      const newRoom = await response.json(); // Cevap: { roomId: 'A4T8B' }

      // Kullanıcıyı yeni odanın URL'sine yönlendir.
      navigate(`/room/${newRoom.roomId}`, { state: { user: userData } });
    } catch (error) {
      console.error("Oda oluşturma hatası:", error);
    }
  };

  // Henüz bağlantı kurulmadıysa bir yükleme ekranı göster.
  if (!isConnected) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>plAIn - AI-Powered Planning Poker</h1>
        </header>
        <main className="app-content">
          <div>Sunucuya bağlanılıyor...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>plAIn - AI-Powered Planning Poker</h1>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Lobby onRoomCreated={createRoom} />} />
          {/* Room component'ine HAZIR stompClient'ı prop olarak geçiyoruz */}
          <Route path="/room/:roomId" element={<Room stompClient={stompClient} />} />
        </Routes>
      </main>
    </div>
  );
}

// AppWrapper'ı (veya doğrudan index.js'deki <Router> sarmalayıcısını) kullanmaya devam
// export default App; // Bu şekilde bırakıp index.js'de <App/>'i Router ile sarmalamak daha temiz.
// Bir önceki cevabımda AppWrapper'ı önermiştim, o yapı doğru.
// Eğer index.js'de <BrowserRouter> varsa, bu App.js'i doğrudan export edebilirsin.
export default App;