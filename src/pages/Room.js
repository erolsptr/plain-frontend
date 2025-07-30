import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import JoinPrompt from '../JoinPrompt';
import TaskDisplay from '../TaskDisplay';
import TaskForm from '../TaskForm';
import VotingCards from '../VotingCards';
import Modal from '../components/Modal';
import '../VotingCards.css';
import '../Room.css';

const SOCKET_URL = 'http://localhost:8080/ws-poker';

const getVoteResult = (votes) => {
    if (!votes || Object.keys(votes).length === 0) return null;
    const voteCounts = Object.values(votes).reduce((acc, vote) => { acc[vote] = (acc[vote] || 0) + 1; return acc; }, {});
    let maxCount = 0; let consensusVote = null; let tie = false;
    for (const vote in voteCounts) {
        if (voteCounts[vote] > maxCount) {
            maxCount = voteCounts[vote]; consensusVote = vote; tie = false;
        } else if (voteCounts[vote] === maxCount) {
            tie = true;
        }
    }
    return tie ? "Anlaşma Yok" : consensusVote;
};

function Room({ user: currentUser }) {
  const { roomId } = useParams();
  const location = useLocation();
  
  const [user, setUser] = useState(currentUser || location.state?.user);
  
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomOwner, setRoomOwner] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTask, setActiveTask] = useState({ title: 'Henüz bir görev belirlenmedi.', description: '', cardSet: '' });
  const [votes, setVotes] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [revealVotes, setRevealVotes] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(location.state?.isNewRoom || false);
  
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [completedResponse, pendingResponse] = await Promise.all([
        fetch(`/api/rooms/${roomId}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/rooms/${roomId}/pending-tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!completedResponse.ok || !pendingResponse.ok) {
        throw new Error('Görevler alınamadı.');
      }
      const completedData = await completedResponse.json();
      const pendingData = await pendingResponse.json();
      setCompletedTasks(completedData);
      setPendingTasks(pendingData);
    } catch (error) {
      console.error("Görevleri çekerken hata:", error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!user?.name) return;
    
    fetchTasks();

    let stateSub, votesSub, revealSub, historySub;
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        stateSub = client.subscribe(`/topic/room/${roomId}/state`, (message) => {
            const roomState = JSON.parse(message.body);
            setRoomOwner(roomState.owner);
            setParticipants(roomState.participants || []);
            setActiveTask(roomState.activeTask || { title: 'Henüz bir görev belirlenmedi.', description: '', cardSet: '' });
            setVotes(roomState.votes || {});
            setRevealVotes(false);
            setHasVoted(false);
        });
        votesSub = client.subscribe(`/topic/room/${roomId}/votes`, (message) => setVotes(JSON.parse(message.body)));
        revealSub = client.subscribe(`/topic/room/${roomId}/reveal`, () => setRevealVotes(true));
        historySub = client.subscribe(`/topic/room/${roomId}/history-updated`, () => {
          fetchTasks();
        });
        client.publish({ destination: `/app/room/${roomId}/register`, body: JSON.stringify({ sender: user.name }) });
      },
      onDisconnect: () => setIsConnected(false),
    });
    client.activate();
    setStompClient(client);
    return () => {
      if (stateSub) stateSub.unsubscribe();
      if (votesSub) votesSub.unsubscribe();
      if (revealSub) revealSub.unsubscribe();
      if (historySub) historySub.unsubscribe(); 
      if (client) client.deactivate();
    };
  }, [user, roomId, fetchTasks]);

  const isModerator = user?.name === roomOwner;
  const allVotesIn = participants.length > 0 && participants.length === Object.keys(votes).length;

  const handleVote = (voteValue) => {
    if (stompClient && user?.name) {
      setHasVoted(true);
      stompClient.publish({ destination: `/app/room/${roomId}/vote`, body: JSON.stringify({ sender: user.name, content: voteValue, type: 'VOTE' }) });
    }
  };

  const handleRevealVotes = () => {
    if (stompClient && user?.name) {
      stompClient.publish({ destination: `/app/room/${roomId}/reveal`, body: JSON.stringify({ sender: user.name }) });
    }
  };

  const handleNewRound = () => {
    if (stompClient && user?.name && isModerator) {
        stompClient.publish({
            destination: `/app/room/${roomId}/new-round`,
            body: JSON.stringify({ sender: user.name })
        });
    }
  };

  const handleSaveResult = async () => {
    if (!isModerator) return;
    const token = localStorage.getItem('token');
    if (!token) { alert("Yetkilendirme anahtarı bulunamadı."); return; }
    try {
      const response = await fetch(`/api/rooms/${roomId}/save-result`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 403) { throw new Error("Sadece oda sahibi sonuçları kaydedebilir."); }
        throw new Error("Sonuçlar sunucuya kaydedilemedi.");
      }
    } catch (error) {
      console.error("Sonuç kaydetme hatası:", error);
      alert(error.message);
    }
  };

  const handleStartVoting = (task) => {
    if (stompClient && isModerator) {
      // Artık yeni bir mesaj nesnesi oluşturmuyoruz.
      // "Hazır Olanlar" listesinden gelen, ID'si dahil tüm task nesnesini doğrudan gönderiyoruz.
      // Sadece gönderenin kim olduğunu ekliyoruz.
      const payload = {
        ...task, // task nesnesinin tüm özelliklerini kopyala (id, title, description, etc.)
        sender: user.name
      };
      
      stompClient.publish({
        destination: `/app/room/${roomId}/set-task`,
        body: JSON.stringify(payload),
      });
    }
  };

  
  
  const toggleTaskForm = () => setShowTaskForm(prev => !prev);
  
  const handleHistoryCardClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (!user) return <JoinPrompt onNameSubmit={(name) => setUser({ name })} />;
  if (!isConnected) return <div className="loading-screen">Odaya bağlanılıyor...</div>;

  const consensus = getVoteResult(votes);

  return (
    <>
      <div className="room-container">
        <div className="side-panel">
          <h3>Oda: {roomId}</h3>
          <div>
            <h4>Katılımcılar ({Object.keys(votes).length}/{participants.length})</h4>
            <ul>
              {participants.map((p) => (
                <li key={p}>
                  {p} {p === roomOwner && '👑'}
                  {votes[p] && !revealVotes && <span className="vote-check">✓</span>}
                  {votes[p] && revealVotes && <span className="vote-value">{votes[p]}</span>}
                </li>
              ))}
            </ul>
          </div>
          
          {isModerator && activeTask.title !== 'Henüz bir görev belirlenmedi.' && !revealVotes && (
            <button 
              onClick={handleRevealVotes} 
              disabled={!allVotesIn} 
              className="reveal-button side-panel-button"
            >
              Oyları Göster
            </button>
          )}
          
          {revealVotes && isModerator && (
            <div className="moderator-actions">
              <button onClick={handleNewRound} className="reveal-button side-panel-button"> 
                Yeni Tur Başlat
              </button>
              <button onClick={handleSaveResult} className="reveal-button side-panel-button primary"> 
                Sonucu Kaydet
              </button>
            </div>
          )}
          
          {isModerator && (
              <button onClick={toggleTaskForm} className="reveal-button new-task-button side-panel-button"> 
                  {showTaskForm ? 'Formu Kapat' : 'Yeni Görev Ekle'}
              </button>
          )}
        </div>
        <div className="main-panel">
          <TaskDisplay task={activeTask} />
          
          {showTaskForm && isModerator ? (
              <TaskForm roomId={roomId} onTaskCreated={() => setShowTaskForm(false)} /> // Başarılı olduğunda sadece formu kapat
          ) : activeTask.title !== 'Henüz bir görev belirlenmedi.' ? (
              revealVotes ? (
                <div className="results-container">
                    <h2>Oylama Sonuçları</h2>
                    {consensus && (
                        <div className="consensus-card">
                            <div className="consensus-label">Karar Oyu</div>
                            <div className="consensus-value">{consensus}</div>
                        </div>
                    )}
                    <div className="results-grid">
                      {Object.entries(votes).map(([name, vote]) => (
                        <div key={name} className="result-card">
                          <div className="vote-value-big">{vote}</div>
                          <div className="voter-name">{name}</div>
                        </div>
                      ))}
                    </div>
                </div>
              ) : (
                  <VotingCards cards={activeTask.cardSet.split(',')} onVote={handleVote} hasVoted={hasVoted} />
              )
          ) : null}

          <div className="task-list-section">
            <div className="task-list-tabs">
              <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>
                Hazır Olanlar ({pendingTasks.length})
              </button>
              <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'active' : ''}>
                Tamamlananlar ({completedTasks.length})
              </button>
            </div>
            
            <div className="task-list-content">
              {activeTab === 'pending' && (
                pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                    <div key={task.id} className="pending-task-card">
                      <span>{task.title}</span>
                      {isModerator && (
                        <button onClick={() => handleStartVoting(task)} className="start-voting-btn">
                          Oylamayı Başlat
                        </button>
                      )}
                    </div>
                  ))
                ) : <p className="placeholder-text">Oylanacak hazır görev yok.</p>
              )}

              {activeTab === 'completed' && (
                completedTasks.length > 0 ? (
                  completedTasks.map(task => (
                    <div key={task.taskId} className="task-history-card" onClick={() => handleHistoryCardClick(task)}>
                      <div className="task-history-card-header">
                        <span className="task-history-card-title">{task.title}</span>
                        <span className="task-history-card-score">{task.consensusScore}</span>
                      </div>
                      <div className="task-history-card-footer">
                        <span>{Object.keys(task.votes).length} Katılımcı</span>
                      </div>
                    </div>
                  ))
                ) : <p className="placeholder-text">Bu odada henüz tamamlanmış bir oylama yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedTask && (
          <div className="task-detail-modal">
            <h2>{selectedTask.title}</h2>
            {selectedTask.description && <p className="task-detail-description">{selectedTask.description}</p>}
            <div className="task-detail-grid">
              <div className="task-detail-consensus">
                <h4>Karar Oyu</h4>
                <div className="task-detail-score">{selectedTask.consensusScore}</div>
              </div>
              <div className="task-detail-votes">
                <h4>Verilen Oylar</h4>
                <ul>
                  {Object.entries(selectedTask.votes).map(([voter, vote]) => (
                    <li key={voter}>
                      <span className="voter-name">{voter}</span>
                      <span className="vote-value">{vote}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default Room;