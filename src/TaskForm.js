import React, { useState } from 'react';

function TaskForm({ roomId, stompClient }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSetTask = () => {
    if (title && stompClient) {
      const task = { title, description };
      stompClient.publish({
        destination: `/app/room/${roomId}/set-task`,
        body: JSON.stringify(task),
      });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="task-form">
      <h4>Yeni Görev Belirle</h4>
      <input
        type="text"
        placeholder="Görev Başlığı"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Açıklama"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleSetTask}>Görevi Ayarla</button>
    </div>
  );
}
export default TaskForm;