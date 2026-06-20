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
import useCharacter from '../../hooks/useCharacter';

const SipaGame = ({ mode, sessionId, gameSlug }) => {
  const { score, updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();
  const canvasRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [localScore, setLocalScore] = useState(0);
  
  const stateRef = useRef({
    sipa: { x: 200, y: 100, vx: 2, vy: 0, radius: 12 },
    foot: { x: 200, y: 350, width: 60, height: 15, active: false },
    gravity: 0.15,
    kickPower: -7.5,
    score: 0,
    gameOver: false,
  });

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animId;

    const state = stateRef.current;
    // Reset stats
    state.sipa = { x: 150 + Math.random() * 100, y: 50, vx: (Math.random() - 0.5) * 4, vy: 0, radius: 12 };
    state.score = 0;
    state.gameOver = false;
    setLocalScore(0);

    const gameLoop = () => {
      // 1. Update Physics
      state.sipa.vy += state.gravity;
      state.sipa.x += state.sipa.vx;
      state.sipa.y += state.sipa.vy;

      // Wall boundaries bounce
      if (state.sipa.x - state.sipa.radius < 0) {
        state.sipa.x = state.sipa.radius;
        state.sipa.vx *= -1;
      }
      if (state.sipa.x + state.sipa.radius > canvas.width) {
        state.sipa.x = canvas.width - state.sipa.radius;
        state.sipa.vx *= -1;
      }

      // Check collision with Foot
      const s = state.sipa;
      const f = state.foot;
      
      const withinX = s.x > f.x - f.width/2 && s.x < f.x + f.width/2;
      const hitLine = s.y + s.radius >= f.y && s.y - s.radius <= f.y + f.height;

      if (withinX && hitLine && s.vy > 0) {
        // Kick logic
        s.y = f.y - s.radius;
        s.vy = state.kickPower;
        // Add velocity offset based on kick offset from center
        const offset = (s.x - f.x) / (f.width / 2);
        s.vx = offset * 3.5;
        
        state.score += 1;
        setLocalScore(state.score);
        updateLocalScore(state.score * 15); // XP award
        
        // Trigger quick visual hit animation
        f.active = true;
        setTimeout(() => { f.active = false; }, 150);
      }

      // Check game over (hit floor)
      if (state.sipa.y - state.sipa.radius > canvas.height) {
        state.gameOver = true;
        setIsPlaying(false);
        finishGame(state.score * 15, null);
        if (state.score > highScore) setHighScore(state.score);
      }

      // 2. Render Board
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background playground
      ctx.fillStyle = '#1A202C';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dust ground
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(0, 365, canvas.width, 35);

      // Draw player shoe/foot indicator (stylized using custom shoesColor and shirtColor)
      const primaryColor = character?.shoesColor || '#E74C3C';
      const secondaryColor = character?.shirtColor || '#1A73E8';
      ctx.fillStyle = f.active ? '#F7B731' : primaryColor;
      ctx.fillRect(f.x - f.width/2, f.y, f.width, f.height - 4);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(f.x - f.width/2, f.y + f.height - 4, f.width, 4);

      // Draw Sipa Washer (metal circle + colorful plastic ribbons)
      // Draw colorful ribbons
      const colors = ['#F7B731', '#E74C3C', '#27AE60', '#1A73E8'];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + (state.sipa.y / 20); // rotate slightly as it flies
        const rx = s.x + Math.cos(angle) * 20;
        const ry = s.y + Math.sin(angle) * 20 - 5;
        
        ctx.beginPath();
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 4;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // Draw metal washer base
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#A0AEC0';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#718096';
      ctx.stroke();
      
      // Washer hole
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius/3, 0, Math.PI * 2);
      ctx.fillStyle = '#1A202C';
      ctx.fill();

      if (!state.gameOver) {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    // Bind controls (keyboard space and mouse move)
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Shift foot left/right towards sipa or trigger kick
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const rootX = e.clientX - rect.left;
      state.foot.x = Math.max(state.foot.width/2, Math.min(canvas.width - state.foot.width/2, rootX));
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);

  return (
    <Box p={6} bg="#2D3748" color="white" minH="450px" display="flex" flexDir="column" justify="space-between">
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Sipa Kick</Heading>
          <Text fontSize="xs" color="gray.300">I-move ang mouse pakaliwa o pakanan para saluhin at sipain ang sipa!</Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs">KASALUKUYANG SIPA</Text>
            <Badge colorScheme="yellow" fontSize="lg">{localScore}</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs">BEST SCORE</Text>
            <Badge colorScheme="green" fontSize="lg">{highScore}</Badge>
          </Box>
        </HStack>
      </HStack>

      <Center flex={1} py={4}>
        {!isPlaying ? (
          <VStack spacing={4}>
            <Heading size="md" color="brand.gold">Handa ka na ba?</Heading>
            <Text fontSize="sm" color="gray.400" textAlign="center" maxW="xs">
              Gamitin ang mouse para i-move ang iyong sapatos at saluhin ang bumabagsak na sipa.
            </Text>
            <Button colorScheme="primary" size="lg" onClick={() => setIsPlaying(true)}>
              Magsimulang Mag-Sipa
            </Button>
          </VStack>
        ) : (
          <Box position="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              style={{ border: '2px solid #718096', borderRadius: '12px', cursor: 'none' }}
            />
          </Box>
        )}
      </Center>
    </Box>
  );
};

export default SipaGame;
