import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import JoinPrompt from './JoinPrompt';
import TaskDisplay from './TaskDisplay';
import TaskForm from './TaskForm';
import VotingCards from './VotingCards';
import './VotingCards.css';

const CARD_SETS = {
  FIBONACCI: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  SCRUM: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  SEQUENTIAL: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  HOURS: ['1', '2', '4', '8', '16', '24', '32', '40'],
  MANUAL: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '13', '20', '?'],
};

const getVoteResult = (votes) => {
    if (!votes || Object.keys(votes).length === 0) return null;
    const voteCounts = Object.values(votes).reduce((acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1;
        return acc;
    }, {});
    let maxCount = 0;
    let consensusVote = null;
    let tie = false;
    for (const vote in voteCounts) {
        if (voteCounts[vote] > maxCount) {
            maxCount = voteCounts[vote];
            consensusVote = vote;
            tie = false;
        } else if (voteCounts[vote] === maxCount) {
            tie = true;
        }
    }
    return tie ? "Anlaşma Yok" : consensusVote;
};


function Room({ stompClient }) {
  const { roomId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user);

  const [roomOwner, setRoomOwner] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTask, setActiveTask] = useState({ title: 'Henüz bir görev belirlenmedi.', description: '', cardSet: '0,1,2,3,5,8,13,21,?,☕' });
  const [votes, setVotes] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [revealVotes, setRevealVotes] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    if (!stompClient || !user?.name || !roomId) {
      return;
    }

    const stateSub = stompClient.subscribe(`/topic/room/${roomId}/state`, (message) => {
        const roomState = JSON.parse(message.body);
        setRoomOwner(roomState.owner);
        setParticipants(roomState.participants || []);
        
        const newActiveTask = roomState.activeTask || { title: 'Henüz bir görev belirlenmedi.', description: '', cardSet: '0,1,2,3,5,8,13,21,?,☕' };
        setActiveTask(newActiveTask);
        
        if (newActiveTask.title !== 'Henüz bir görev belirlenmedi.') {
            setShowTaskForm(false);
        } else {
            setShowTaskForm(user?.name === roomState.owner);
        }

        setVotes(roomState.votes || {});
        setRevealVotes(false);
        setHasVoted(false);
    });
    
    const votesSub = stompClient.subscribe(`/topic/room/${roomId}/votes`, (message) => {
      setVotes(JSON.parse(message.body));
    });

    const revealSub = stompClient.subscribe(`/topic/room/${roomId}/reveal`, () => {
      setRevealVotes(true);
    });

    stompClient.publish({
      destination: `/app/room/${roomId}/register`,
      body: JSON.stringify({ sender: user.name }),
    });

    return () => {
      stateSub.unsubscribe();
      votesSub.unsubscribe();
      revealSub.unsubscribe();
    };
  }, [stompClient, user, roomId]);

  const isModerator = user?.name === roomOwner;
  const allVotesIn = participants.length > 0 && participants.length === Object.keys(votes).length;

  const handleVote = (voteValue) => {
    if (stompClient && user?.name) {
      setHasVoted(true);
      stompClient.publish({
        destination: `/app/room/${roomId}/vote`,
        body: JSON.stringify({ sender: user.name, content: voteValue, type: 'VOTE' }),
      });
    }
  };

  const handleRevealVotes = () => {
    if (stompClient && user?.name) {
      stompClient.publish({
        destination: `/app/room/${roomId}/reveal`,
        body: JSON.stringify({ sender: user.name })
      });
    }
  };

  const handleNewRound = () => {
    if (stompClient && user?.name && isModerator && activeTask) {
        const taskMessage = {
            sender: user.name,
            content: activeTask.title,
            description: activeTask.description,
            cardSet: activeTask.cardSet,
            type: 'SET_TASK'
        };

        stompClient.publish({
            destination: `/app/room/${roomId}/set-task`,
            body: JSON.stringify(taskMessage),
        });
    }
  };
  
  const toggleTaskForm = () => {
    setShowTaskForm(prev => !prev);
  }

  if (!user) {
    return <JoinPrompt onNameSubmit={(name) => setUser({ name })} />;
  }
  if (!stompClient) {
    return <div>Odaya bağlanılıyor...</div>;
  }

  const currentCards = activeTask.cardSet ? activeTask.cardSet.split(',') : [];
  const consensus = getVoteResult(votes);

  return (
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
        
        {activeTask.title !== 'Henüz bir görev belirlenmedi.' && !revealVotes && (
          <button 
            onClick={handleRevealVotes} 
            disabled={!isModerator || !allVotesIn} 
            className="reveal-button side-panel-button" 
            title={!isModerator ? "Sadece oda sahibi oyları açabilir." : ""}
          >
            Oyları Göster
          </button>
        )}
        
        {revealVotes && isModerator && (
          <button onClick={handleNewRound} className="reveal-button side-panel-button"> 
            Yeni Tur Başlat (Re-vote)
          </button>
        )}
        
        {isModerator && (
            <button onClick={toggleTaskForm} className="reveal-button new-task-button side-panel-button"> 
                {showTaskForm ? 'Formu Kapat' : 'Yeni Görev / Değiştir'}
            </button>
        )}
      </div>

      <div className="main-panel">
        <TaskDisplay task={activeTask} />
        
        {showTaskForm && isModerator ? (
            <TaskForm roomId={roomId} stompClient={stompClient} user={user} />
        ) : revealVotes ? (
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
            activeTask.title !== 'Henüz bir görev belirlenmedi.' && (
                <VotingCards cards={currentCards} onVote={handleVote} hasVoted={hasVoted} />
            )
        )}
      </div>
    </div>
  );
}

export default Room;