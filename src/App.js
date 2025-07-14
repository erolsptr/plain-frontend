import React, { useState } from 'react';
import './App.css';
import Lobby from './Lobby';
import Room from './Room';

function App() {
  const [user, setUser] = useState(null); // { name: 'Erol', roomId: '123' }
  const [stompClient, setStompClient] = useState(null);

  const handleJoin = (userData, client) => {
    setUser(userData);
    setStompClient(client);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>plAIn - AI-Powered Planning Poker</h1>
        {!user ? (
          <Lobby onJoin={handleJoin} />
        ) : (
          <Room user={user} stompClient={stompClient} />
        )}
      </header>
    </div>
  );
}

export default App;