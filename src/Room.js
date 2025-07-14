// Lütfen bu dosyanın içeriğini, mevcut Room.js dosyanla tamamen değiştir.

import React, { useState, useEffect } from 'react';
import TaskDisplay from './TaskDisplay';
import TaskForm from './TaskForm';

function Room({ user, stompClient }) {
  const [participants, setParticipants] = useState([]);
  const [activeTask, setActiveTask] = useState({ title: 'Henüz bir görev belirlenmedi.', description: '' });

  useEffect(() => {
    let participantsSubscription;
    let taskSubscription;
    let privateTaskSubscription;

    if (stompClient) {
      // 1. ABONELİKLERİ BAŞLAT
      // Katılımcı listesini dinle
      participantsSubscription = stompClient.subscribe(
        `/topic/room/${user.roomId}/participants`,
        (message) => {
          const userList = JSON.parse(message.body);
          setParticipants(userList);
        }
      );
      // Görev güncellemelerini dinle
      taskSubscription = stompClient.subscribe(
        `/topic/room/${user.roomId}/task`,
        (message) => {
          const task = JSON.parse(message.body);
          setActiveTask(task);
        }
      );
      // Sana özel gelecek görev bilgisini dinle
      privateTaskSubscription = stompClient.subscribe(
        `/user/queue/task`,
        (message) => {
          const task = JSON.parse(message.body);
          setActiveTask(task);
        }
      );

      // 2. SUNUCUYA İSTEKLERİ GÖNDER
      // Odaya katıldığını sunucuya bildir (KATILIMCI LİSTESİ İÇİN)
      stompClient.publish({
        destination: `/app/room/${user.roomId}/join`,
        body: JSON.stringify({ sender: user.name, type: 'JOIN' }),
      });

      // Sunucudan mevcut görevi talep et (GÖREV BİLGİSİ İÇİN)
      stompClient.publish({
        destination: `/app/room/${user.roomId}/get-task`,
        body: '', // Sadece tetiklemek için, içerik önemli değil
      });
    }

    // 3. TEMİZLİK FONKSİYONU
    return () => {
      if (participantsSubscription) participantsSubscription.unsubscribe();
      if (taskSubscription) taskSubscription.unsubscribe();
      if (privateTaskSubscription) privateTaskSubscription.unsubscribe();
    };
  }, [stompClient, user.roomId, user.name]);


  return (
    <div className="room-container">
      {/* SAĞ PANEL: Katılımcılar */}
      <div className="side-panel">
        <h3>Oda: {user.roomId}</h3>
        <div style={{ border: '1px solid white', padding: '10px', minWidth: '200px' }}>
          <h4>Katılımcılar ({participants.length})</h4>
          <ul>
            {participants.map((p, index) => (
              <li key={index}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ANA PANEL: Görev ve Oylama Alanı */}
      <div className="main-panel">
        <TaskDisplay task={activeTask} />
        <hr style={{ borderColor: '#4a5058', margin: '20px 0' }} />
        <TaskForm roomId={user.roomId} stompClient={stompClient} />
      </div>
    </div>
  );
}

export default Room;