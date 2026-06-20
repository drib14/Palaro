import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Center,
  useToast,
} from '@chakra-ui/react';
import * as THREE from 'three';
import useGame from '../../hooks/useGame';
import useCharacter from '../../hooks/useCharacter';
import Character3D from '../../components/Character/Character3D';

// Obstacle definitions for collision & scenery
const obstacles = [
  // Bahay Kubo 1
  { id: 'kubo1', type: 'box', x: -8, z: -8, w: 4, d: 4, label: 'Bahay Kubo' },
  // Bahay Kubo 2
  { id: 'kubo2', type: 'box', x: 8, z: -6, w: 4, d: 4, label: 'Bahay Kubo' },
  // Sari-Sari Store
  { id: 'store', type: 'box', x: -7, z: 6, w: 3, d: 4, label: 'Sari-Sari Store' },
  // Basketball Post / Backboard
  { id: 'hoop', type: 'box', x: 8, z: 8, w: 1.5, d: 1.5, label: 'Basketball Court' },
  // Trees (represented as circles for colliders)
  { id: 'tree_center', type: 'circle', x: 0, z: 0, r: 1.2 },
  { id: 'tree1', type: 'circle', x: -12, z: -12, r: 1.0 },
  { id: 'tree2', type: 'circle', x: 12, z: -12, r: 1.0 },
  { id: 'tree3', type: 'circle', x: -12, z: 12, r: 1.0 },
  { id: 'tree4', type: 'circle', x: 12, z: 12, r: 1.0 },
  // Outer fence boundaries
  { id: 'fence_back', type: 'box', x: 0, z: -14.5, w: 29.5, d: 0.5 },
  { id: 'fence_front_left', type: 'box', x: -8, z: 14.5, w: 13, d: 0.5 },
  { id: 'fence_front_right', type: 'box', x: 8, z: 14.5, w: 13, d: 0.5 },
  { id: 'fence_left', type: 'box', x: -14.5, z: 0, w: 0.5, d: 29.5 },
  { id: 'fence_right', type: 'box', x: 14.5, z: 0, w: 0.5, d: 29.5 },
];

// Helper to check collision
const checkCollision = (x, z, radius = 0.5) => {
  // Arena boundary check (-14.8 to 14.8)
  if (x < -14.2 || x > 14.2 || z < -14.2 || z > 14.2) return true;

  for (const obs of obstacles) {
    if (obs.type === 'box') {
      const minX = obs.x - obs.w / 2 - radius;
      const maxX = obs.x + obs.w / 2 + radius;
      const minZ = obs.z - obs.d / 2 - radius;
      const maxZ = obs.z + obs.d / 2 + radius;
      if (x > minX && x < maxX && z > minZ && z < maxZ) {
        return true;
      }
    } else if (obs.type === 'circle') {
      const dx = x - obs.x;
      const dz = z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obs.r + radius) {
        return true;
      }
    }
  }
  return false;
};

// 3D Scenery Components
const NeighborhoodScenery = () => {
  return (
    <group>
      {/* Grass Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.9} />
      </mesh>

      {/* Main Concrete Street (going North-South through the center) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[5, 32]} />
        <meshStandardMaterial color="#78909C" roughness={0.7} />
      </mesh>

      {/* Street Yellow Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#FFEB3B" />
      </mesh>

      {/* Outer Fences (Wooden style around yard) */}
      {obstacles
        .filter((o) => o.id.startsWith('fence'))
        .map((f) => (
          <mesh key={f.id} position={[f.x, 0.6, f.z]} castShadow receiveShadow>
            <boxGeometry args={[f.w, 1.2, f.d]} />
            <meshStandardMaterial color="#8D6E63" roughness={0.8} />
          </mesh>
        ))}

      {/* Bahay Kubo 1 */}
      <group position={[-8, 0, -8]}>
        {/* Bamboo pillars */}
        <mesh position={[-1.7, 0.4, -1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[1.7, 0.4, -1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[-1.7, 0.4, 1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[1.7, 0.4, 1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        {/* Main Hut Body */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 1.6, 3.8]} />
          <meshStandardMaterial color="#A1887F" roughness={0.9} />
        </mesh>
        {/* Roof (Pyramid/Cone) */}
        <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.3, 1.6, 4]} />
          <meshStandardMaterial color="#5D4037" roughness={1.0} />
        </mesh>
        {/* Ladder steps */}
        <mesh position={[0, 0.2, 2.1]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[1.0, 0.1, 0.6]} />
          <meshStandardMaterial color="#704F4F" />
        </mesh>
      </group>

      {/* Bahay Kubo 2 */}
      <group position={[8, 0, -6]}>
        {/* Bamboo pillars */}
        <mesh position={[-1.7, 0.4, -1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[1.7, 0.4, -1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[-1.7, 0.4, 1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        <mesh position={[1.7, 0.4, 1.7]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#D7CCC8" /></mesh>
        {/* Main Hut Body */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 1.6, 3.8]} />
          <meshStandardMaterial color="#B08968" roughness={0.9} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.3, 1.6, 4]} />
          <meshStandardMaterial color="#7F5539" roughness={1.0} />
        </mesh>
      </group>

      {/* Sari-Sari Store */}
      <group position={[-7, 0, 6]}>
        {/* Main Store Building */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 2.4, 3.8]} />
          <meshStandardMaterial color="#FFE082" roughness={0.8} />
        </mesh>
        {/* Shop Counter Open Cut */}
        <mesh position={[1.2, 1.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 2.5]} />
          <meshStandardMaterial color="#FFB300" />
        </mesh>
        {/* Roof awning */}
        <mesh position={[1.3, 1.9, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[1.0, 0.1, 3.0]} />
          <meshStandardMaterial color="#D32F2F" />
        </mesh>
        {/* Tiny sign board */}
        <mesh position={[1.4, 2.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.8, 0.4]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Basketball Court */}
      <group position={[8, 0, 8]}>
        {/* Half court floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#90A4AE" roughness={0.6} />
        </mesh>
        {/* Hoop pole */}
        <mesh position={[0, 2.2, 2.8]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 4.4]} />
          <meshStandardMaterial color="#455A64" />
        </mesh>
        {/* Backboard */}
        <mesh position={[0, 4.0, 2.6]} castShadow>
          <boxGeometry args={[1.6, 1.0, 0.1]} />
          <meshStandardMaterial color="#ECEFF1" />
        </mesh>
        {/* Red Ring */}
        <mesh position={[0, 3.7, 2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.3, 0.03, 8, 24]} />
          <meshStandardMaterial color="#D32F2F" />
        </mesh>
      </group>

      {/* Trees */}
      {obstacles
        .filter((o) => o.id.startsWith('tree'))
        .map((t) => (
          <group key={t.id} position={[t.x, 0, t.z]}>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.35, 3]} />
              <meshStandardMaterial color="#4E342E" roughness={0.9} />
            </mesh>
            {/* Leaves Cluster */}
            <mesh position={[0, 3.4, 0]} castShadow>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial color="#2E7D32" roughness={0.9} />
            </mesh>
            <mesh position={[0.5, 4.0, 0.3]} castShadow>
              <sphereGeometry args={[0.9, 16, 16]} />
              <meshStandardMaterial color="#388E3C" roughness={0.9} />
            </mesh>
            <mesh position={[-0.4, 4.2, -0.4]} castShadow>
              <sphereGeometry args={[0.9, 16, 16]} />
              <meshStandardMaterial color="#1B5E20" roughness={0.9} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

// 3D Player Tagger Component
const PlayableTagger = ({ playerPos, rotationY, character }) => {
  return (
    <group position={[playerPos.x, 0.6, playerPos.z]} rotation={[0, rotationY, 0]}>
      {/* Shadow Blob underneath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]}>
        <ringGeometry args={[0, 0.5, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      <Character3D config={character} />
    </group>
  );
};

// 3D Hidden Hiders (Kids) Component
const HidersRenderer = ({ hiders, playerPos }) => {
  return (
    <group>
      {hiders.map((h) => {
        // Calculate dynamic bobbing if found
        const isFound = h.found;

        return (
          <HiderNPC
            key={h.id}
            hider={h}
            isFound={isFound}
            playerPos={playerPos}
          />
        );
      })}
    </group>
  );
};

const HiderNPC = ({ hider, isFound, playerPos }) => {
  const meshRef = useRef();

  // Bobbing / Happy jump animation for found hiders
  useFrame((state) => {
    if (isFound && meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.abs(Math.sin(time * 6.5)) * 0.5;
      meshRef.current.rotation.y = time * 3;
    } else if (meshRef.current) {
      // Small idle breathing bob
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.sin(time * 2 + hider.id) * 0.05;
      
      // Rotate slowly to look towards player if close
      const dx = playerPos.x - hider.x;
      const dz = playerPos.z - hider.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 6) {
        meshRef.current.rotation.y = Math.atan2(dx, dz);
      }
    }
  });

  const hiderConfigs = {
    1: { skinTone: 'light', shirtColor: '#F44336', pantsColor: '#161B22', hairstyle: 'hair-default', hairColor: '#3E2723' },
    2: { skinTone: 'medium', shirtColor: '#E91E63', pantsColor: '#2C3E50', hairstyle: 'hair-long', hairColor: '#E65100' },
    3: { skinTone: 'tan', shirtColor: '#9C27B0', pantsColor: '#004D40', hairstyle: 'hair-curly', hairColor: '#212121' },
    4: { skinTone: 'brown', shirtColor: '#00BCD4', pantsColor: '#3E2723', hairstyle: 'hair-long', hairColor: '#0D47A1' },
    5: { skinTone: 'dark', shirtColor: '#4CAF50', pantsColor: '#BF360C', hairstyle: 'hair-default', hairColor: '#1B5E20', hat: 'cap' },
  };

  const config = hiderConfigs[hider.id] || { skinTone: 'medium', shirtColor: hider.color };

  return (
    <group ref={meshRef} position={[hider.x, 0.5, hider.z]}>
      {/* Hide indicator or show faint visual if close or found */}
      <group visible={true}>
        {/* Render 3D Custom Character model */}
        <group scale={[0.9, 0.9, 0.9]}>
          <Character3D config={config} showShadow={isFound} />
        </group>

        {/* Happy smile arms if found */}
        {isFound && (
          <group>
            {/* Found badge indicator */}
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[0.8, 0.25, 0.05]} />
              <meshBasicMaterial color="#4CAF50" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};

// Camera script to follow the player
const ThirdPersonCamera = ({ playerPos }) => {
  const cameraOffset = new THREE.Vector3(0, 7, 9); // height, distance behind

  useFrame((state) => {
    const targetCameraPos = new THREE.Vector3(
      playerPos.x + cameraOffset.x,
      playerPos.y + cameraOffset.y,
      playerPos.z + cameraOffset.z
    );

    // Smooth camera tracking
    state.camera.position.lerp(targetCameraPos, 0.08);
    state.camera.lookAt(playerPos.x, playerPos.y + 0.6, playerPos.z);
  });

  return null;
};

// Primary controller containing game loop and drawing the canvas
const Taguan3DGame = ({ mode, sessionId, gameSlug }) => {
  const { updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();
  const toast = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [scoreVal, setScoreVal] = useState(0);
  const [outcome, setOutcome] = useState('');
  
  // Player Position state
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0.1, z: 12 }); // Start at front center street
  const [playerRotY, setPlayerRotY] = useState(0);

  // Hidden kids state
  const [hiders, setHiders] = useState([
    { id: 1, name: 'Juan', x: -9.5, z: -9.5, found: false, color: '#F44336' },
    { id: 2, name: 'Maria', x: 9.5, z: -7.5, found: false, color: '#E91E63' },
    { id: 3, name: 'Pedro', x: -7.5, z: 8.0, found: false, color: '#9C27B0' },
    { id: 4, name: 'Luningning', x: 12.5, z: -13.0, found: false, color: '#00BCD4' },
    { id: 5, name: 'Tonton', x: -13.0, z: 11.5, found: false, color: '#4CAF50' },
  ]);

  const stateRef = useRef({
    keys: {},
    player: { x: 0, y: 0.1, z: 12 },
    rotY: 0,
    hiders: [],
  });

  useEffect(() => {
    stateRef.current.hiders = hiders;
  }, [hiders]);

  // Main input loop (runs outside R3F standard loops to update raw states)
  useEffect(() => {
    if (!isPlaying) return;

    let animId;
    const speed = 0.18;
    const state = stateRef.current;

    const gameTick = () => {
      let vx = 0;
      let vz = 0;

      if (state.keys['KeyW'] || state.keys['ArrowUp']) vz = -1;
      if (state.keys['KeyS'] || state.keys['ArrowDown']) vz = 1;
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) vx = -1;
      if (state.keys['KeyD'] || state.keys['ArrowRight']) vx = 1;

      // Normalize speed diagonal
      if (vx !== 0 && vz !== 0) {
        vx *= 0.7071;
        vz *= 0.7071;
      }

      if (vx !== 0 || vz !== 0) {
        const nextX = state.player.x + vx * speed;
        const nextZ = state.player.z + vz * speed;

        // Collision check
        if (!checkCollision(nextX, nextZ)) {
          state.player.x = nextX;
          state.player.z = nextZ;
          setPlayerPos({ x: nextX, y: 0.1, z: nextZ });
        }

        // Set rotation angle based on movement vector
        const targetRot = Math.atan2(vx, vz);
        state.rotY = targetRot;
        setPlayerRotY(targetRot);
      }

      // Check proximity of unfound kids
      state.hiders.forEach((h) => {
        if (h.found) return;

        const dx = state.player.x - h.x;
        const dz = state.player.z - h.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Found threshold (2.2 units)
        if (dist < 2.2) {
          tagHider(h.id, h.name);
        }
      });

      if (isPlaying) {
        animId = requestAnimationFrame(gameTick);
      }
    };

    animId = requestAnimationFrame(gameTick);

    // Key events
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

  // Game timer countdown
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          triggerGameOver(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const tagHider = (id, name) => {
    setHiders((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, found: true } : h));
      const foundCount = updated.filter((h) => h.found).length;
      
      toast({
        title: `Nahanap si ${name}!`,
        description: `Bantay: ${foundCount} / 5 ang nakita na.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      // Update XP score dynamically
      const nextScore = foundCount * 200;
      setScoreVal(nextScore);
      updateLocalScore(nextScore);

      // Check win condition
      if (foundCount === 5) {
        triggerGameOver(true, nextScore);
      }

      return updated;
    });
  };

  const triggerGameOver = (isWin, finalPoints = scoreVal) => {
    setIsPlaying(false);
    setGameOver(true);

    if (isWin) {
      const bonus = timeLeft * 10; // 10 bonus points per remaining second
      const grandTotal = finalPoints + bonus;
      setScoreVal(grandTotal);
      updateLocalScore(grandTotal);
      setOutcome(`Binabati kita! Nakita mo silang lahat sa loob ng oras! XP na Nakuha: ${grandTotal}`);
      finishGame(grandTotal, 'winner-user');
    } else {
      setOutcome(`Sayang! Naubusan ka ng oras. Nakita mo ang ${hiders.filter(h => h.found).length} na kalaro.`);
      finishGame(scoreVal, null);
    }
  };

  const startGame = () => {
    setHiders([
      { id: 1, name: 'Juan', x: -9.5, z: -9.5, found: false, color: '#F44336' },
      { id: 2, name: 'Maria', x: 9.5, z: -7.5, found: false, color: '#E91E63' },
      { id: 3, name: 'Pedro', x: -7.5, z: 8.0, found: false, color: '#9C27B0' },
      { id: 4, name: 'Luningning', x: 12.5, z: -13.0, found: false, color: '#00BCD4' },
      { id: 5, name: 'Tonton', x: -13.0, z: 11.5, found: false, color: '#4CAF50' },
    ]);
    setPlayerPos({ x: 0, y: 0.1, z: 12 });
    setPlayerRotY(0);
    stateRef.current.player = { x: 0, y: 0.1, z: 12 };
    stateRef.current.rotY = 0;
    
    setTimeLeft(60);
    setScoreVal(0);
    setGameOver(false);
    setOutcome('');
    setIsPlaying(true);
  };

  const foundCount = hiders.filter((h) => h.found).length;

  return (
    <Box p={6} bg="#2D3748" color="white" minH="500px" display="flex" flexDir="column" justify="space-between">
      {/* Top Header metrics */}
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Taguan 3D (Pinoy Hide-and-Seek)</Heading>
          <Text fontSize="xs" color="gray.400">
            Gamitin ang <b>W,A,S,D</b> o <b>Arrow Keys</b> para maglakad. Libutin ang kanto para mahanap ang 5 batang nakatago!
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">NAHANAP NA BATA</Text>
            <Badge colorScheme="green" fontSize="lg">{foundCount} / 5</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">ORAS NA NATITIRA</Text>
            <Badge colorScheme={timeLeft < 15 ? 'red' : 'yellow'} fontSize="lg">{timeLeft}s</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">PUNTOS XP</Text>
            <Badge colorScheme="purple" fontSize="lg">{scoreVal}</Badge>
          </Box>
        </HStack>
      </HStack>

      {/* 3D Scene Viewport */}
      <Center flex={1} py={2} minH="380px" bg="#1A202C" borderRadius="2xl" position="relative" overflow="hidden">
        {!isPlaying ? (
          <VStack spacing={4} zIndex={5} bg="rgba(26, 32, 44, 0.9)" p={6} borderRadius="xl" border="1px solid #4A5568" m={4}>
            {gameOver ? (
              <VStack spacing={2}>
                <Heading size="md" color="yellow.400">Tapos na ang Laro</Heading>
                <Text fontSize="sm" textAlign="center" maxW="sm">{outcome}</Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Heading size="md" color="yellow.400">Taya ka! (You are It)</Heading>
                <Text fontSize="sm" color="gray.300" textAlign="center" maxW="sm">
                  Lahat ng kalaro mo ay nagtago sa paligid ng kanto — sa likod ng mga Bahay Kubo, Sari-Sari store, at mga puno.
                  Libutin ang barangay upang mahanap silang lahat bago maubos ang 60 segundong oras!
                </Text>
              </VStack>
            )}
            <Button colorScheme="yellow" size="lg" onClick={startGame}>
              {gameOver ? 'Maglaro Ulit' : 'Simulan ang Paghahanap'}
            </Button>
          </VStack>
        ) : (
          <Box w="full" h="380px" position="relative">
            <Canvas camera={{ position: [0, 10, 12], fov: 45 }} shadows>
              <ambientLight intensity={0.75} />
              <directionalLight
                position={[10, 15, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-10, 8, -10]} intensity={0.4} />

              {/* Scenery Layout */}
              <NeighborhoodScenery />

              {/* Tagger character (Player) */}
              <PlayableTagger playerPos={playerPos} rotationY={playerRotY} character={character} />

              {/* Hiders list */}
              <HidersRenderer hiders={hiders} playerPos={playerPos} />

              {/* Custom script following the tagger */}
              <ThirdPersonCamera playerPos={playerPos} />
            </Canvas>
          </Box>
        )}
      </Center>

      {/* Proximity warning and helper guide */}
      {isPlaying && (
        <Center mt={2}>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Gabay: Lumapit ng husto sa bata upang i-tag at makita sila.
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default Taguan3DGame;
