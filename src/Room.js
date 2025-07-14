import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import JoinPrompt from './JoinPrompt';
import TaskDisplay from './TaskDisplay';
import TaskForm from './TaskForm';

function Room({ stompClient }) {
  const { roomId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user);

  const [participants, setParticipants] = useState([]);
  const [activeTask, setActiveTask] = useState({ title: 'Henüz bir görev belirlenmedi.', description: '' });

  useEffect(() => {
    // stompClient veya user bilgisi hazır değilse, hiçbir şey yapma.
    if (!stompClient || !user?.name || !roomId) {
      return;
    }

    // --- ABONELİKLER ---
    // Artık sadece iki genel kanalı dinliyoruz.
    
    const participantsSub = stompClient.subscribe(`/topic/room/${roomId}/participants`, (message) => {
      setParticipants(JSON.parse(message.body));
    });

    const taskSub = stompClient.subscribe(`/topic/room/${roomId}/task`, (message) => {
      setActiveTask(JSON.parse(message.body));
    });

    // --- TEK BİR İSTEK: KAYDOL ---
    // Sunucuya "Ben geldim" diyoruz. Sunucu bu mesaja cevaben
    // yukarıda abone olduğumuz kanallara güncel bilgileri gönderecek.
    stompClient.publish({
      destination: `/app/room/${roomId}/register`,
      body: JSON.stringify({ sender: user.name }),
    });

    // Component DOM'dan kaldırıldığında abonelikleri temizle
    return () => {
      participantsSub.unsubscribe();
      taskSub.unsubscribe();
    };
  }, [stompClient, user, roomId]);

  if (!user) {
    return <JoinPrompt onNameSubmit={(name) => setUser({ name })} />;
  }

  if (!stompClient) {
    return <div>Odaya bağlanılıyor...</div>;
  }

  return (
    <div className="room-container">
      <div className="side-panel">
        <h3>Oda: {roomId}</h3>
        <div>
          <h4>Katılımcılar ({participants.length})</h4>
          <ul>{participants.map((p, index) => <li key={index}>{p}</li>)}</ul>
        </div>
      </div>
      <div className="main-panel">
        <TaskDisplay task={activeTask} />
        <hr />
        <TaskForm roomId={roomId} stompClient={stompClient} />
      </div>
    </div>
  );
}

export default Room;