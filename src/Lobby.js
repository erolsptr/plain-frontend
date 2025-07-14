import React, { useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8080/ws-poker';

function Lobby({ onJoin }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  // Lobby.js içinde

const connectAndJoin = () => {
    if (!name || !roomId) {
      setError('İsim ve Oda ID alanları zorunludur.');
      return;
    }
    setError('');

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      onConnect: () => {
        // ARTIK BURADA "JOIN" MESAJI GÖNDERMİYORUZ!
        // Sadece başarılı bağlantı bilgisini ve client'ı yukarı iletiyoruz.
        console.log("Bağlantı başarılı, App component'ine bilgi veriliyor.");
        onJoin({ name, roomId }, stompClient);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setError('Sunucuya bağlanırken bir hata oluştu.');
      },
    });

    stompClient.activate();
  };

  return (
    <div>
      <h2>Odaya Katıl</h2>
      <input
        type="text"
        placeholder="İsminiz"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Oda ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={connectAndJoin}>Katıl</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Lobby;