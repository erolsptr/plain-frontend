import React, { useState, useEffect } from 'react';

const CARD_SETS = {
  FIBONACCI: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  SCRUM: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  SEQUENTIAL: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  HOURS: ['1', '2', '4', '8', '16', '24', '32', '40'],
};
const MANUAL_CARDS = [...new Set([...CARD_SETS.FIBONACCI, ...CARD_SETS.SCRUM, ...CARD_SETS.SEQUENTIAL, ...CARD_SETS.HOURS])].sort((a,b) => Number(a) - Number(b));


function TaskForm({ roomId, stompClient, user }) { 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cardSet, setCardSet] = useState('FIBONACCI');
  const [selectedCards, setSelectedCards] = useState(new Set(CARD_SETS.FIBONACCI));

  useEffect(() => {
    if (cardSet === 'MANUAL') {
      setSelectedCards(new Set(MANUAL_CARDS));
    } else {
      setSelectedCards(new Set(CARD_SETS[cardSet]));
    }
  }, [cardSet]);

  const handleCardToggle = (cardValue) => {
    // Artık herhangi bir mod kontrolü yapmıyoruz, her zaman çalışır.
    setSelectedCards(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(cardValue)) {
        newSelected.delete(cardValue);
      } else {
        newSelected.add(cardValue);
      }
      return newSelected;
    });
  };

  const handleSetTask = () => {
    if (title && stompClient && user?.name) { 
      const taskMessage = {
        sender: user.name,
        content: title, 
        description: description, 
        cardSet: Array.from(selectedCards).join(','),
        type: 'SET_TASK'
      };

      stompClient.publish({
        destination: `/app/room/${roomId}/set-task`,
        body: JSON.stringify(taskMessage),
      });

      setTitle('');
      setDescription('');
    }
  };

  const currentVisibleCards = cardSet === 'MANUAL' ? MANUAL_CARDS : CARD_SETS[cardSet];

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
        placeholder="Açıklama (opsiyonel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <div className="card-set-selector">
        <label htmlFor="card-set">Oylama Seti:</label>
        <select 
          id="card-set"
          value={cardSet} 
          onChange={(e) => setCardSet(e.target.value)}
        >
          <option value="FIBONACCI">Fibonacci</option>
          <option value="SCRUM">Scrum</option>
          <option value="SEQUENTIAL">Sıralı</option>
          <option value="HOURS">Saat</option>
          <option value="MANUAL">Tümünü Göster/Düzenle</option>
        </select>
      </div>

      <div className="customize-cards-container">
        {currentVisibleCards.map(card => (
          // div yerine label kullanarak tüm alana tıklanabilirlik kazandırıyoruz.
          <label key={card} className="card-checkbox-item">
            <input 
              type="checkbox"
              value={card}
              checked={selectedCards.has(card)}
              onChange={() => handleCardToggle(card)}
              // disabled özelliği kaldırıldı, artık her zaman aktif.
            />
            {card} 
          </label>
        ))}
      </div>

      <button onClick={handleSetTask}>Görevi Ayarla</button>
    </div>
  );
}

export default TaskForm;