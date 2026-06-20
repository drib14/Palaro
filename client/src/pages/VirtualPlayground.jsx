import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  useToast,
  Center,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import useCharacter from '../hooks/useCharacter';
import CharacterRenderer from '../components/Character/CharacterRenderer';

const VirtualPlayground = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const { character } = useCharacter();
  const toast = useToast();
  
  const canvasRef = useRef(null);
  const [chatMessage, setChatMessage] = useState('');
  const [activeSpeechBubbles, setActiveSpeechBubbles] = useState({}); // { [userId]: { text, expires } }

  const stateRef = useRef({
    localPlayer: { x: 200, y: 200, direction: 'down' },
    otherPlayers: new Map(), // { [userId]: { username, x, y, character, direction } }
    keys: {},
  });

  useEffect(() => {
    if (!socket || !character) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const state = stateRef.current;

    // Join playground session
    socket.emit('playground:join', {
      x: state.localPlayer.x,
      y: state.localPlayer.y,
      character,
    });

    // Listeners
    socket.on('playground:users_list', (users) => {
      users.forEach((u) => {
        if (u.userId !== user?._id) {
          state.otherPlayers.set(u.userId, u);
        }
      });
    });

    socket.on('playground:user_joined', (u) => {
      state.otherPlayers.set(u.userId, u);
      toast({
        title: `${u.username} entered playground`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    });

    socket.on('playground:user_moved', ({ userId, x, y, direction }) => {
      const p = state.otherPlayers.get(userId);
      if (p) {
        p.x = x;
        p.y = y;
        p.direction = direction;
      }
    });

    socket.on('playground:bubble_received', ({ userId, username, message }) => {
      setActiveSpeechBubbles((prev) => ({
        ...prev,
        [userId]: {
          text: message,
          expires: Date.now() + 5000, // bubble lasts 5s
        },
      }));
    });

    socket.on('playground:user_left', ({ userId }) => {
      const p = state.otherPlayers.get(userId);
      if (p) {
        state.otherPlayers.delete(userId);
        toast({
          title: `${p.username} left playground`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      }
    });

    // Game loop for rendering
    let animId;
    const loop = () => {
      // 1. Move Local Player
      let moved = false;
      let dir = state.localPlayer.direction;
      const speed = 3;

      if (state.keys['KeyW'] || state.keys['ArrowUp']) {
        state.localPlayer.y -= speed;
        dir = 'up';
        moved = true;
      }
      if (state.keys['KeyS'] || state.keys['ArrowDown']) {
        state.localPlayer.y += speed;
        dir = 'down';
        moved = true;
      }
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) {
        state.localPlayer.x -= speed;
        dir = 'left';
        moved = true;
      }
      if (state.keys['KeyD'] || state.keys['ArrowRight']) {
        state.localPlayer.x += speed;
        dir = 'right';
        moved = true;
      }

      if (moved) {
        state.localPlayer.direction = dir;
        // Keep bounds
        state.localPlayer.x = Math.max(20, Math.min(canvas.width - 20, state.localPlayer.x));
        state.localPlayer.y = Math.max(20, Math.min(canvas.height - 20, state.localPlayer.y));

        // Sync position via socket
        socket.emit('playground:move', {
          x: state.localPlayer.x,
          y: state.localPlayer.y,
          direction: dir,
        });
      }

      // 2. Draw Playground Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grass background
      ctx.fillStyle = '#27AE60';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Play sandpit grid
      ctx.fillStyle = '#E5A65D';
      ctx.fillRect(100, 100, 400, 200);
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeRect(100, 100, 400, 200);

      // Draw other players
      state.otherPlayers.forEach((p) => {
        // Draw avatar circle marker
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#E74C3C'; // red circle for other players
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Inter';
        ctx.fillText(p.username, p.x - 20, p.y - 22);

        // Render chat bubbles
        const bubble = activeSpeechBubbles[p.userId];
        if (bubble && bubble.expires > Date.now()) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(p.x - 40, p.y - 50, 80, 20);
          ctx.fillStyle = '#000000';
          ctx.fillText(bubble.text, p.x - 35, p.y - 37);
        }
      });

      // Draw Local Player
      ctx.beginPath();
      ctx.arc(state.localPlayer.x, state.localPlayer.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#F7B731'; // Gold circle for local player
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Inter';
      ctx.fillText(user?.username || 'You', state.localPlayer.x - 12, state.localPlayer.y - 22);

      // Render local bubble
      const localBubble = activeSpeechBubbles[user?._id];
      if (localBubble && localBubble.expires > Date.now()) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(state.localPlayer.x - 40, state.localPlayer.y - 50, 80, 20);
        ctx.fillStyle = '#000000';
        ctx.fillText(localBubble.text, state.localPlayer.x - 35, state.localPlayer.y - 37);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Bind Keys
    const handleKeyDown = (e) => {
      state.keys[e.code] = true;
    };
    const handleKeyUp = (e) => {
      state.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      socket.emit('playground:leave');
      socket.off('playground:users_list');
      socket.off('playground:user_joined');
      socket.off('playground:user_moved');
      socket.off('playground:bubble_received');
      socket.off('playground:user_left');
    };
  }, [socket, character, user, activeSpeechBubbles]);

  const sendBubble = () => {
    if (!socket || !chatMessage.trim()) return;
    
    socket.emit('playground:bubble', { message: chatMessage });
    
    setActiveSpeechBubbles((prev) => ({
      ...prev,
      [user?._id]: {
        text: chatMessage.trim(),
        expires: Date.now() + 5000,
      },
    }));

    setChatMessage('');
  };

  return (
    <MainLayout>
      <Box maxW="5xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Palaro Playground
          </Heading>
          <Text color="gray.500">
            Maglakad gamit ang WASD/Arrow keys. Sumulat ng chat bubble para makipag-usap sa mga kalapit na manlalaro!
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
          <Box gridColumn={{ base: 'span 1', lg: 'span 8' }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              style={{ border: '4px solid #161b22', borderRadius: '16px', background: '#27AE60', width: '100%' }}
            />

            {/* Speach bubble triggers */}
            <HStack mt={4}>
              <Input
                placeholder="Sumulat ng speech bubble dito..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendBubble()}
                focusBorderColor="brand.gold"
                borderRadius="xl"
              />
              <Button colorScheme="primary" onClick={sendBubble}>
                Ibulong
              </Button>
            </HStack>
          </Box>

          <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
            <Card>
              <CardBody>
                <Heading size="sm" mb={4} fontFamily="heading">
                  Mga Online na Kalaro
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <HStack p={2} bg="brand.nightMarket" borderRadius="xl">
                    <CharacterRenderer config={character} size="40px" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{user?.username} (Ikaw)</Text>
                      <Badge colorScheme="yellow">Level {user?.level}</Badge>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Box>
    </MainLayout>
  );
};

export default VirtualPlayground;
