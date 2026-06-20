import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Center,
} from '@chakra-ui/react';
import useGame from '../../hooks/useGame';

const PatinteroGame = ({ mode, sessionId, gameSlug }) => {
  const { score, updateLocalScore, finishGame } = useGame(sessionId);
  const canvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [outcome, setOutcome] = useState('');

  const stateRef = useRef({
    player: { x: 200, y: 375, radius: 10, speed: 4 },
    guards: [
      { y: 300, x: 200, direction: 1, speed: 2, range: 360 }, // lane 1 guard
      { y: 200, x: 200, direction: -1, speed: 3, range: 360 }, // lane 2 guard
      { y: 100, x: 200, direction: 1, speed: 4, range: 360 }, // lane 3 guard
    ],
    gridLines: [300, 200, 100],
    keys: {},
    crossedLines: [false, false, false],
    returnedLines: [false, false, false],
    score: 0,
    hasReachedEnd: false,
  });

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    const state = stateRef.current;

    // Reset game state
    state.player = { x: 200, y: 375, radius: 10, speed: 4 };
    state.guards.forEach((g, idx) => {
      g.x = 50 + Math.random() * 300;
      g.speed = 2 + idx * 0.8;
    });
    state.crossedLines = [false, false, false];
    state.returnedLines = [false, false, false];
    state.hasReachedEnd = false;
    state.score = 0;
    setLocalScore(0);
    setOutcome('');

    const gameLoop = () => {
      // 1. Keyboard movement updates
      if (state.keys['KeyW'] || state.keys['ArrowUp']) state.player.y -= state.player.speed;
      if (state.keys['KeyS'] || state.keys['ArrowDown']) state.player.y += state.player.speed;
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) state.player.x -= state.player.speed;
      if (state.keys['KeyD'] || state.keys['ArrowRight']) state.player.x += state.player.speed;

      // Keep player inside canvas
      state.player.x = Math.max(state.player.radius, Math.min(canvas.width - state.player.radius, state.player.x));
      state.player.y = Math.max(state.player.radius, Math.min(canvas.height - state.player.radius, state.player.y));

      // 2. Update Guards movement
      state.guards.forEach((guard) => {
        guard.x += guard.speed * guard.direction;
        
        // Bounce guards off side walls (grid box boundary: 20 to 380)
        if (guard.x < 30 || guard.x > 370) {
          guard.direction *= -1;
        }

        // 3. Collision check: Tagged by guard!
        const dx = state.player.x - guard.x;
        const dy = state.player.y - guard.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < state.player.radius + 15) {
          // Tagged! Game Over
          setIsPlaying(false);
          setOutcome('TAYA! Hinuli ka ng bantay.');
          finishGame(state.score * 50, null);
        }
      });

      // 4. Checking Grid line crossings
      const py = state.player.y;

      // Heading Upward crossings
      if (py < 300 && !state.crossedLines[0]) {
        state.crossedLines[0] = true;
        state.score += 10;
        setLocalScore(state.score);
      }
      if (py < 200 && !state.crossedLines[1]) {
        state.crossedLines[1] = true;
        state.score += 20;
        setLocalScore(state.score);
      }
      if (py < 100 && !state.crossedLines[2]) {
        state.crossedLines[2] = true;
        state.score += 30;
        state.hasReachedEnd = true;
        setLocalScore(state.score);
      }

      // Check return home victory
      if (state.hasReachedEnd && py > 350) {
        setIsPlaying(false);
        setOutcome('LIGTAS! Matagumpay kang nakatawid.');
        state.score += 50;
        setLocalScore(state.score);
        updateLocalScore(state.score * 5); // Submit highscore XP
        finishGame(state.score * 5, 'winner-user');
      }

      // 5. Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Playground dirt background
      ctx.fillStyle = '#E5A65D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Lines (chalk lines)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;

      // Outer boundaries
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Horizontal patrol lanes
      state.gridLines.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
      });

      // Vertical central line (divided grid)
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 20);
      ctx.lineTo(canvas.width / 2, canvas.height - 20);
      ctx.stroke();

      // Draw Guards (patrollers)
      state.guards.forEach((guard) => {
        ctx.beginPath();
        ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#E74C3C'; // Red represents opponents
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw Player Runner
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1A73E8'; // Blue represents player
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isPlaying) {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    // Bind keys
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
    };
  }, [isPlaying]);

  return (
    <Box p={6} bg="#5C3A21" color="white" minH="450px" display="flex" flexDir="column" justify="space-between">
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Patintero Tag</Heading>
          <Text fontSize="xs" color="gray.300">Gamitin ang W,A,S,D o Arrow Keys para umiwas sa mga bantay at tumawid!</Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs">PUNTOS</Text>
            <Badge colorScheme="yellow" fontSize="lg">{localScore}</Badge>
          </Box>
        </HStack>
      </HStack>

      <Center flex={1} py={4}>
        {!isPlaying ? (
          <VStack spacing={4}>
            {outcome && <Heading size="md" color="brand.gold">{outcome}</Heading>}
            <Text fontSize="sm" color="gray.400" textAlign="center" maxW="xs">
              Tumawid sa 3 horizontal na linya nang hindi natataya ng mga bantay, at bumalik sa ibaba para manalo.
            </Text>
            <Button colorScheme="primary" size="lg" onClick={() => setIsPlaying(true)}>
              Magsimulang Tumakbo
            </Button>
          </VStack>
        ) : (
          <Box position="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              style={{ border: '4px solid #fff', borderRadius: '12px' }}
            />
          </Box>
        )}
      </Center>
    </Box>
  );
};

export default PatinteroGame;
