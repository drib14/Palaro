import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center as ThreeCenter } from '@react-three/drei';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Center,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import * as THREE from 'three';
import useGame from '../../hooks/useGame';
import useCharacter from '../../hooks/useCharacter';
import Character3D from '../../components/Character/Character3D';

// 3D Scene Game Engine Component (Runs inside <Canvas>)
const HolenSimulation = ({ isPlaying, onScoreUpdate, onGameOver, onShootCountUpdate, character }) => {
  const ringRadius = 5;
  const marbleRadius = 0.25;
  const numMarbles = 6;
  const friction = 0.985; // deceleration per frame

  // Game state refs
  const shooterRef = useRef();
  const marblesRef = useRef([]);
  const charGroupRef = useRef();
  const gameState = useRef({
    shooter: { x: 0, z: ringRadius - 1.2, vx: 0, vz: 0, active: true },
    marbles: [], // { id, x, z, vx, vz, active }
    aimAngle: Math.PI, // aiming direction towards center (0 = right, PI = up/forward)
    power: 5,
    shotsRemaining: 5,
    isRolling: false,
  });

  // Initialize target marbles inside the ring
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < numMarbles; i++) {
      // Place them in a small cluster near the center
      const angle = (i * Math.PI * 2) / numMarbles;
      const dist = 0.5 + Math.random() * 0.8;
      arr.push({
        id: i,
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        vx: 0,
        vz: 0,
        active: true,
      });
    }
    gameState.current.marbles = arr;
    gameState.current.shooter = { x: 0, z: ringRadius - 1.2, vx: 0, vz: 0, active: true };
    gameState.current.aimAngle = Math.PI;
    gameState.current.isRolling = false;
  }, [isPlaying]);

  // Bind keyboard and pointer controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || gameState.current.isRolling) return;
      
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        gameState.current.aimAngle -= 0.05;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        gameState.current.aimAngle += 0.05;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const shoot = () => {
    if (gameState.current.isRolling || gameState.current.shotsRemaining <= 0) return;
    
    const state = gameState.current;
    const force = state.power * 2.2;
    state.shooter.vx = Math.cos(state.aimAngle) * force;
    state.shooter.vz = Math.sin(state.aimAngle) * force;
    state.isRolling = true;
    state.shotsRemaining -= 1;
    onShootCountUpdate(state.shotsRemaining);
  };

  // Main game physics loop
  useFrame(() => {
    if (!isPlaying) return;

    const state = gameState.current;

    // Update 3D Character position/rotation behind shooter
    if (charGroupRef.current) {
      const s = state.shooter;
      const aim = state.aimAngle;
      const distBehind = 0.85;
      charGroupRef.current.position.set(
        s.x - Math.cos(aim) * distBehind,
        0.35,
        s.z - Math.sin(aim) * distBehind
      );
      charGroupRef.current.rotation.y = -aim + Math.PI / 2;
    }

    let anyMoving = false;

    // 1. Move Shooter
    if (state.shooter.active) {
      const s = state.shooter;
      s.x += s.vx * 0.016;
      s.z += s.vz * 0.016;
      s.vx *= friction;
      s.vz *= friction;

      if (Math.abs(s.vx) > 0.05 || Math.abs(s.vz) > 0.05) {
        anyMoving = true;
      } else {
        s.vx = 0;
        s.vz = 0;
      }

      // Check if shooter went outside the ring
      const distFromCenter = Math.sqrt(s.x * s.x + s.z * s.z);
      if (distFromCenter > ringRadius + 0.5) {
        s.active = false;
        s.vx = 0;
        s.vz = 0;
      }

      // Update 3D object position
      if (shooterRef.current) {
        shooterRef.current.position.set(s.x, marbleRadius, s.z);
      }
    }

    // 2. Move Marbles
    state.marbles.forEach((m, idx) => {
      if (!m.active) return;

      m.x += m.vx * 0.016;
      m.z += m.vz * 0.016;
      m.vx *= friction;
      m.vz *= friction;

      if (Math.abs(m.vx) > 0.05 || Math.abs(m.vz) > 0.05) {
        anyMoving = true;
      } else {
        m.vx = 0;
        m.vz = 0;
      }

      // Check if marble knocked outside the ring (SCORING POINT)
      const distFromCenter = Math.sqrt(m.x * m.x + m.z * m.z);
      if (distFromCenter > ringRadius) {
        m.active = false;
        onScoreUpdate(); // Triggers react re-render for UI score increment
      }

      // Update 3D objects position
      const mesh = marblesRef.current[idx];
      if (mesh) {
        mesh.position.set(m.x, marbleRadius, m.z);
        // hide visual if knocked out
        mesh.visible = m.active;
      }
    });

    // 3. Collision Detection: Shooter vs Marbles
    if (state.shooter.active) {
      const s = state.shooter;
      state.marbles.forEach((m) => {
        if (!m.active) return;
        const dx = m.x - s.x;
        const dz = m.z - s.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = marbleRadius * 2;

        if (dist < minDist) {
          // Resolve elastic collision
          const angle = Math.atan2(dz, dx);
          const targetX = s.x + Math.cos(angle) * minDist;
          const targetZ = s.z + Math.sin(angle) * minDist;

          // Push them apart
          m.x = targetX;
          m.z = targetZ;

          // Transfer velocities
          const vxDiff = s.vx - m.vx;
          const vzDiff = s.vz - m.vz;
          
          m.vx += vxDiff * 0.8;
          m.vz += vzDiff * 0.8;
          s.vx -= vxDiff * 0.8;
          s.vz -= vzDiff * 0.8;
          anyMoving = true;
        }
      });
    }

    // 4. Collision Detection: Marble vs Marble
    for (let i = 0; i < state.marbles.length; i++) {
      const m1 = state.marbles[i];
      if (!m1.active) continue;

      for (let j = i + 1; j < state.marbles.length; j++) {
        const m2 = state.marbles[j];
        if (!m2.active) continue;

        const dx = m2.x - m1.x;
        const dz = m2.z - m1.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = marbleRadius * 2;

        if (dist < minDist) {
          const angle = Math.atan2(dz, dx);
          
          // push apart
          m2.x = m1.x + Math.cos(angle) * minDist;
          m2.z = m1.z + Math.sin(angle) * minDist;

          const vxDiff = m1.vx - m2.vx;
          const vzDiff = m1.vz - m2.vz;

          m2.vx += vxDiff * 0.7;
          m2.vz += vzDiff * 0.7;
          m1.vx -= vxDiff * 0.7;
          m1.vz -= vzDiff * 0.7;
          anyMoving = true;
        }
      }
    }

    // 5. Check if round movement stopped
    if (state.isRolling && !anyMoving) {
      state.isRolling = false;
      
      // Reset shooter back to start line if it's inactive/flung out, or keep its position
      if (!state.shooter.active) {
        state.shooter = { x: 0, z: ringRadius - 1.2, vx: 0, vz: 0, active: true };
      } else {
        // Stop shooter in place
        state.shooter.vx = 0;
        state.shooter.vz = 0;
      }

      // Check Game Over
      const activeMarblesCount = state.marbles.filter(m => m.active).length;
      if (activeMarblesCount === 0 || state.shotsRemaining <= 0) {
        onGameOver();
      }
    }
  });

  return (
    <group>
      {/* Sandy Playground Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} />
      </mesh>

      {/* Sand Circle Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[ringRadius - 0.08, ringRadius + 0.08, 64]} />
        <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
      </mesh>

      {/* Target Marbles Cluster */}
      {gameState.current.marbles.map((m, idx) => (
        <mesh
          key={m.id}
          ref={(el) => (marblesRef.current[idx] = el)}
          position={[m.x, marbleRadius, m.z]}
          castShadow
        >
          <sphereGeometry args={[marbleRadius, 32, 32]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#1A73E8' : '#27AE60'}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Shooter Marble (Pamato) */}
      {gameState.current.shooter.active && (
        <mesh
          ref={shooterRef}
          position={[gameState.current.shooter.x, marbleRadius, gameState.current.shooter.z]}
          castShadow
        >
          <sphereGeometry args={[marbleRadius, 32, 32]} />
          <meshStandardMaterial
            color="#E74C3C"
            roughness={0.05}
            metalness={0.3}
          />
        </mesh>
      )}

      {/* Aiming Reticle (Line indicating shot vector when aiming) */}
      {isPlaying && !gameState.current.isRolling && gameState.current.shooter.active && (
        <mesh
          position={[
            gameState.current.shooter.x + Math.cos(gameState.current.aimAngle) * 0.8,
            0.05,
            gameState.current.shooter.z + Math.sin(gameState.current.aimAngle) * 0.8,
          ]}
        >
          <boxGeometry args={[0.1, 0.02, 1.2]} />
          <meshBasicMaterial color="#F7B731" />
        </mesh>
      )}

      {/* 3D Character aiming behind shooter */}
      {isPlaying && gameState.current.shooter.active && !gameState.current.isRolling && (
        <group ref={charGroupRef} position={[0, 0.35, ringRadius - 2.05]}>
          <Character3D config={character} />
        </group>
      )}
    </group>
  );
};

const HolenGame = ({ mode, sessionId, gameSlug }) => {
  const { score, updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleScoreUpdate = () => {
    setLocalScore((s) => {
      const nextScore = s + 1;
      updateLocalScore(nextScore * 100); // 100 points per marble
      return nextScore;
    });
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    
    // Evaluate performance
    let msg = '';
    if (localScore >= 6) {
      msg = 'Kahanga-hanga! Naalis mo ang lahat ng holen!';
      finishGame(localScore * 100, 'winner-user');
    } else if (localScore > 0) {
      msg = `Magaling! Naalis mo ang ${localScore} na holen.`;
      finishGame(localScore * 100, null);
    } else {
      msg = 'Walang holen na naalis. Subukan ulit!';
      finishGame(0, null);
    }
    setOutcome(msg);
  };

  const startGame = () => {
    setLocalScore(0);
    setShotsLeft(5);
    setGameOver(false);
    setOutcome('');
    setIsPlaying(true);
  };

  return (
    <Box p={6} bg="#5C3A21" color="white" minH="500px" display="flex" flexDir="column" justify="space-between">
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Holen 3D (Pinoy Marbles)</Heading>
          <Text fontSize="xs" color="gray.300">
            Gamitin ang <b>Arrow Left/Right</b> o <b>A/D</b> para i-aim ang pulang pamato. Pindutin ang <b>SPACE</b> para tumira!
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs">NAALIS NA HOLEN</Text>
            <Badge colorScheme="yellow" fontSize="lg">{localScore} / 6</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs">TIRA NA NATITIRA</Text>
            <Badge colorScheme="red" fontSize="lg">{shotsLeft}</Badge>
          </Box>
        </HStack>
      </HStack>

      <Center flex={1} py={2} minH="350px" bg="#1A0D06" borderRadius="2xl" position="relative" overflow="hidden">
        {!isPlaying ? (
          <VStack spacing={4} zIndex={5} bg="rgba(26, 13, 6, 0.85)" p={6} borderRadius="xl" border="1px solid #5C3A21" m={4}>
            {gameOver ? (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Tapos na ang Laro</Heading>
                <Text fontSize="sm" textAlign="center">{outcome}</Text>
                <Text fontSize="md" fontWeight="bold">Nakuhang Puntos: {localScore * 100} XP</Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Handa ka na bang sumabak?</Heading>
                <Text fontSize="sm" color="gray.300" textAlign="center" maxW="sm">
                  Kailangan mong ma-flick o mapatalsik ang anim na holen palabas ng puting bilog gamit ang iyong pulang pamato sa loob ng 5 tira.
                </Text>
              </VStack>
            )}
            <Button colorScheme="primary" size="lg" onClick={startGame}>
              {gameOver ? 'Maglaro Ulit' : 'Magsimula ng Laro'}
            </Button>
          </VStack>
        ) : (
          <Box w="full" h="380px" position="relative">
            <Canvas camera={{ position: [0, 6, 8], fov: 45 }} shadows>
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-5, 5, -5]} intensity={0.5} />
              
              <HolenSimulation
                isPlaying={isPlaying}
                onScoreUpdate={handleScoreUpdate}
                onGameOver={handleGameOver}
                onShootCountUpdate={setShotsLeft}
                character={character}
              />
              
              <OrbitControls
                enableZoom={true}
                maxPolarAngle={Math.PI / 2.1} // don't go below ground level
                minDistance={4}
                maxDistance={12}
              />
            </Canvas>
          </Box>
        )}
      </Center>

      <Center mt={4}>
        <Text fontSize="xs" color="gray.400">
          Tip: Gamitin ang drag/mouse para i-rotate ang camera para sa mas magandang anggulo ng tira.
        </Text>
      </Center>
    </Box>
  );
};

export default HolenGame;
