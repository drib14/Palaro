import { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import useSocket from './useSocket';

const useGame = (sessionId) => {
  const socket = useSocket();
  const {
    activeSession,
    matchmakingStatus,
    opponent,
    score,
    opponentScore,
    setActiveSession,
    updateScore,
    updateOpponentScore,
    setMatchmakingStatus,
    setOpponent,
    submitGameResult,
  } = useGameStore();

  useEffect(() => {
    if (!socket || !sessionId) return;

    // Join the game session room
    socket.emit('game:join_session', { sessionId });

    // Handle session state synchronization
    socket.on('game:session_state', (session) => {
      setActiveSession(session);
      // Identify opponent if PVP
      if (session.mode === 'PVP') {
        const opposingPlayer = session.players.find(
          p => p.userId !== socket.userId // socket stores userId during auth
        );
        if (opposingPlayer) {
          // If we have access to user records on client, look up username
          setOpponent(opposingPlayer);
        }
      }
    });

    socket.on('game:player_joined', ({ userId, username }) => {
      console.log(`🕹️ Opponent joined: ${username}`);
      setOpponent({ userId, username });
    });

    socket.on('game:score_updated', ({ userId, score: newScore }) => {
      const opposingPlayer = activeSession?.players.find(p => p.userId.toString() !== userId.toString());
      if (opposingPlayer && opposingPlayer.userId === userId) {
        updateOpponentScore(newScore);
      }
    });

    // Clean up
    return () => {
      socket.off('game:session_state');
      socket.off('game:player_joined');
      socket.off('game:score_updated');
    };
  }, [socket, sessionId, activeSession, setActiveSession, setOpponent, updateOpponentScore]);

  const sendGameAction = (action, data) => {
    if (socket && sessionId) {
      socket.emit('game:action', { sessionId, action, data });
    }
  };

  const updateLocalScore = (newScore) => {
    updateScore(newScore);
    if (socket && sessionId) {
      socket.emit('game:update_score', { sessionId, score: newScore });
    }
  };

  const finishGame = (finalScore, winnerId) => {
    if (socket && sessionId) {
      socket.emit('game:finish', {
        sessionId,
        finalScores: [
          { userId: socket.userId, score: finalScore },
          { userId: opponent?.userId, score: opponentScore }
        ],
        winnerId,
      });
    }
  };

  return {
    activeSession,
    matchmakingStatus,
    opponent,
    score,
    opponentScore,
    sendGameAction,
    updateLocalScore,
    finishGame,
  };
};

export default useGame;
