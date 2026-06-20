import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Center,
  Spinner,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Badge,
  useToast,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import useGameStore from '../store/gameStore';

// Game component imports
import SungkaGame from '../games/sungka/SungkaGame';
import PatinteroGame from '../games/patintero/PatinteroGame';
import TeksGame from '../games/teks/TeksGame';
import SipaGame from '../games/sipa/SipaGame';
import HolenGame from '../games/holen/HolenGame';

const GamePlay = () => {
  const { gameSlug } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'pvc'; // pvp or pvc
  
  const socket = useSocket();
  const { user } = useAuth();
  const {
    activeSession,
    matchmakingStatus,
    opponent,
    setActiveSession,
    setMatchmakingStatus,
    setOpponent,
  } = useGameStore();

  const [localSessionId, setLocalSessionId] = useState(null);
  const [matchingTime, setMatchingTime] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  // Matchmaking timer
  useEffect(() => {
    let timer;
    if (matchmakingStatus === 'searching') {
      timer = setInterval(() => {
        setMatchingTime((t) => t + 1);
      }, 1000);
    } else {
      setMatchingTime(0);
    }
    return () => clearInterval(timer);
  }, [matchmakingStatus]);

  // Handle matchmaking & local sessions setup
  useEffect(() => {
    if (mode === 'pvc') {
      // Local PVC setup
      setLocalSessionId('pvc-session');
      setActiveSession({
        _id: 'pvc-session',
        gameSlug,
        mode: 'PVC',
        status: 'active',
        players: [{ userId: user?._id, score: 0 }],
      });
      setMatchmakingStatus('idle');
      return;
    }

    // PVP Matchmaking via Socket
    if (!socket) return;

    if (matchmakingStatus === 'idle') {
      socket.emit('matchmaking:join', { gameSlug });
      setMatchmakingStatus('searching');
    }

    // Listeners
    socket.on('matchmaking:status', ({ status }) => {
      setMatchmakingStatus(status);
    });

    socket.on('matchmaking:matched', ({ sessionId, opponent: oppName }) => {
      toast({
        title: 'Kalaro Nahanap!',
        description: `Kalaro mo si ${oppName}. Naglo-load ng laro...`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setOpponent({ username: oppName });
      setLocalSessionId(sessionId);
      setMatchmakingStatus('matched');
      
      // Stop listening to matchmaking events once matched
      socket.off('matchmaking:matched');
      socket.off('matchmaking:status');
    });

    socket.on('matchmaking:error', (err) => {
      toast({
        title: 'Matchmaking Error',
        description: err,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/games');
    });

    return () => {
      if (socket) {
        socket.emit('matchmaking:leave', { gameSlug });
        socket.off('matchmaking:matched');
        socket.off('matchmaking:status');
        socket.off('matchmaking:error');
      }
      setActiveSession(null);
      setMatchmakingStatus('idle');
    };
  }, [socket, gameSlug, mode, user, navigate, setActiveSession, setMatchmakingStatus, setOpponent, toast]);

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('matchmaking:leave', { gameSlug });
    }
    setMatchmakingStatus('idle');
    navigate('/games');
  };

  // Select game component dynamically
  const renderGame = () => {
    const props = {
      mode,
      sessionId: localSessionId,
      gameSlug,
    };

    switch (gameSlug) {
      case 'sungka':
        return <SungkaGame {...props} />;
      case 'patintero':
        return <PatinteroGame {...props} />;
      case 'teks':
        return <TeksGame {...props} />;
      case 'sipa':
        return <SipaGame {...props} />;
      case 'holen':
        return <HolenGame {...props} />;
      default:
        // Fallback placeholder/generic play component
        return (
          <Center h="400px" bg="brand.bahayKubo" borderRadius="2xl" flexDir="column" p={6}>
            <Heading size="md" mb={4}>Nililikha pa ang {gameSlug}</Heading>
            <Text color="gray.500" mb={6} textAlign="center" maxW="md">
              Kasalukuyang ginagawa ang visual engine para sa larong ito. Maaari kang sumubok ng ibang laro tulad ng Sungka o Teks!
            </Text>
            <Button colorScheme="primary" onClick={() => navigate('/games')}>
              Bumalik sa Pagpipilian
            </Button>
          </Center>
        );
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <Box maxW="4xl" mx="auto" px={4} py={4}>
        {/* 1. Searching screen */}
        {mode === 'pvp' && matchmakingStatus === 'searching' && (
          <Center h="70vh">
            <VStack spacing={6}>
              <Spinner size="xl" thickness="4px" color="brand.gold" speed="0.8s" />
              <VStack spacing={2}>
                <Heading size="md">Naghahanap ng Kalaro...</Heading>
                <Text color="gray.500">
                  Oras ng paghahanap: {matchingTime}s
                </Text>
              </VStack>
              <Button colorScheme="red" variant="ghost" onClick={cancelMatchmaking}>
                Kanselahin ang Paghahanap
              </Button>
            </VStack>
          </Center>
        )}

        {/* 2. Matched transition screen */}
        {mode === 'pvp' && matchmakingStatus === 'matched' && !activeSession && (
          <Center h="70vh">
            <VStack spacing={8}>
              <Heading size="lg" fontFamily="heading">
                Nagsisimula na ang Laban!
              </Heading>
              <HStack spacing={12} align="center">
                <VStack>
                  <Avatar size="xl" name={user?.username} border="3px solid" borderColor="brand.gold" />
                  <Text fontWeight="bold">{user?.username}</Text>
                  <Badge colorScheme="yellow">Level {user?.level}</Badge>
                </VStack>
                <Text fontSize="2xl" fontWeight="black" color="brand.red">
                  VS
                </Text>
                <VStack>
                  <Avatar size="xl" name={opponent?.username || 'Kalaro'} border="3px solid" borderColor="brand.blue" />
                  <Text fontWeight="bold">{opponent?.username || 'Kalaro'}</Text>
                  <Badge colorScheme="blue">Level 1</Badge>
                </VStack>
              </HStack>
              <Spinner size="md" color="brand.gold" />
            </VStack>
          </Center>
        )}

        {/* 3. Game display screen */}
        {((mode === 'pvc') || (mode === 'pvp' && matchmakingStatus === 'matched' && activeSession)) && (
          <Box className="anim-slide-up">
            <HStack justify="space-between" mb={4}>
              <Heading size="md" fontFamily="heading">
                Laro: {gameSlug.toUpperCase()} ({mode.toUpperCase()})
              </Heading>
              <Button size="sm" variant="secondary" onClick={() => navigate('/games')}>
                Sumuko / Lumabas
              </Button>
            </HStack>

            {/* Game Canvas Container */}
            <Box boxShadow="2xl" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor="gray.800" bg="black">
              {renderGame()}
            </Box>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default GamePlay;
