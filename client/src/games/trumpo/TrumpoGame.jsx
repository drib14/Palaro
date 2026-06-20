import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Box as ChakraBox,
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

// 3D Spinning Top Mesh
const TrumpoTop = ({ position, rotationY, color, rpm }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && rpm > 0) {
      // Fast spin animation
      meshRef.current.rotation.y += (rpm / 60) * 0.1;
      // Slight wobbling precessional motion
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 10) * 0.12;
      meshRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 10) * 0.12;
    }
  });

  return (
    <group ref={meshRef} position={[position.x, 0.4, position.z]}>
      {/* Top Body (Double Cone / stacked cylinders) */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.05, 0.5, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.35, 0.2, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Metal peg tip at the bottom */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#B0BEC5" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Dynamic spinning sparks overlay */}
      {rpm > 100 && (
        <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.22, 16]} />
          <meshBasicMaterial color="#FFB300" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Physics driver component inside Canvas
const TrumpoSimulation = ({
  isPlaying,
  playerPower,
  playerAngle,
  onGameOver,
  playerCharacter,
}) => {
  const friction = 0.993; // speed slow down
  const ringRadius = 4.5;

  const playerTop = useRef({ x: -3.5, z: 0, vx: 0, vz: 0, rpm: 0, active: false });
  const botTop = useRef({ x: 3.5, z: 0, vx: 0, vz: 0, rpm: 0, active: false });
  
  const playerMeshRef = useRef();
  const botMeshRef = useRef();

  const [simData, setSimData] = useState({
    playerPos: { x: -3.5, z: 0 },
    botPos: { x: 3.5, z: 0 },
    playerRpm: 0,
    botRpm: 0,
  });

  // Mock bot character config
  const botCharacter = {
    skinTone: 'tan',
    shirtColor: '#E53935',
    pantsColor: '#2C3E50',
    hairstyle: 'hair-curly',
    hairColor: '#3E2723',
    hat: 'bandana',
  };

  useEffect(() => {
    if (isPlaying) {
      // Initialize Trumpo states
      playerTop.current = { x: -3.2, z: 0, vx: 0, vz: 0, rpm: 0, active: false };
      botTop.current = { x: 3.2, z: 0, vx: 0, vz: 0, rpm: 0, active: false };
      setSimData({
        playerPos: { x: -3.2, z: 0 },
        botPos: { x: 3.2, z: 0 },
        playerRpm: 0,
        botRpm: 0,
      });

      // Automatically launch bot after a small delay
      const botTimer = setTimeout(() => {
        const force = 4 + Math.random() * 3;
        const angle = Math.PI + (Math.random() - 0.5) * 0.5; // aim towards center
        botTop.current = {
          x: 3.2,
          z: 0,
          vx: Math.cos(angle) * force,
          vz: Math.sin(angle) * force,
          rpm: 2500,
          active: true,
        };
      }, 1000);

      return () => clearTimeout(botTimer);
    }
  }, [isPlaying]);

  // Handle player launch triggers
  useEffect(() => {
    if (isPlaying && playerPower > 0) {
      const force = playerPower * 0.9;
      playerTop.current = {
        x: -3.2,
        z: 0,
        vx: Math.cos(playerAngle) * force,
        vz: Math.sin(playerAngle) * force,
        rpm: 2500,
        active: true,
      };
    }
  }, [playerPower, playerAngle, isPlaying]);

  useFrame(() => {
    if (!isPlaying) return;

    const p = playerTop.current;
    const b = botTop.current;
    let updated = false;

    // Move player top
    if (p.active) {
      p.x += p.vx * 0.016;
      p.z += p.vz * 0.016;
      p.vx *= friction;
      p.vz *= friction;
      p.rpm = Math.max(0, p.rpm - 6);

      // Decelerate velocities to rest center pull
      p.vx += (-p.x) * 0.002;
      p.vz += (-p.z) * 0.002;

      // check boundaries
      const dist = Math.sqrt(p.x * p.x + p.z * p.z);
      if (dist > ringRadius || p.rpm <= 0) {
        p.active = false;
        p.rpm = 0;
      }
      updated = true;
    }

    // Move bot top
    if (b.active) {
      b.x += b.vx * 0.016;
      b.z += b.vz * 0.016;
      b.vx *= friction;
      b.vz *= friction;
      b.rpm = Math.max(0, b.rpm - 6);

      b.vx += (-b.x) * 0.002;
      b.vz += (-b.z) * 0.002;

      const dist = Math.sqrt(b.x * b.x + b.z * b.z);
      if (dist > ringRadius || b.rpm <= 0) {
        b.active = false;
        b.rpm = 0;
      }
      updated = true;
    }

    // Collision detection: Player top vs Bot top
    if (p.active && b.active) {
      const dx = b.x - p.x;
      const dz = b.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.75) {
        // Elastic clash
        const angle = Math.atan2(dz, dx);
        
        // Push apart
        const overlap = 0.75 - dist;
        p.x -= Math.cos(angle) * overlap * 0.5;
        p.z -= Math.sin(angle) * overlap * 0.5;
        b.x += Math.cos(angle) * overlap * 0.5;
        b.z += Math.sin(angle) * overlap * 0.5;

        // Exchange velocities
        const tempVx = p.vx;
        const tempVz = p.vz;
        p.vx = b.vx * 1.1;
        p.vz = b.vz * 1.1;
        b.vx = tempVx * 1.1;
        b.vz = tempVz * 1.1;

        // Transfer RPM energy slightly
        const tempRpm = p.rpm;
        p.rpm = Math.max(100, p.rpm - 150);
        b.rpm = Math.max(100, b.rpm - 150);
      }
    }

    if (updated) {
      setSimData({
        playerPos: { x: p.x, z: p.z },
        botPos: { x: b.x, z: b.z },
        playerRpm: p.rpm,
        botRpm: b.rpm,
      });
    }

    // Win/Loss evaluations
    const bothTopsSpawned = (p.active || p.rpm > 0) && (b.active || b.rpm > 0);
    if (bothTopsSpawned && !p.active && !b.active) {
      // Both stopped or left
      onGameOver('draw');
    } else if (playerTop.current.active && !botTop.current.active && botTop.current.rpm === 0) {
      // Bot is out first
      onGameOver('win');
    } else if (!playerTop.current.active && playerTop.current.rpm === 0 && botTop.current.active) {
      // Player is out first
      onGameOver('lose');
    }
  });

  return (
    <group>
      {/* Sandy Pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#BCAAA4" roughness={0.9} />
      </mesh>

      {/* Ring Boundary lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[ringRadius - 0.06, ringRadius + 0.06, 64]} />
        <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
      </mesh>

      {/* R3F Characters references standing outside the ring */}
      {/* Player character standing */}
      <group position={[-5.8, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Character3D config={playerCharacter} />
      </group>

      {/* Bot opponent character standing */}
      <group position={[5.8, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Character3D config={botCharacter} />
      </group>

      {/* Spinning tops meshes */}
      {playerTop.current.active && (
        <TrumpoTop
          position={simData.playerPos}
          rpm={simData.playerRpm}
          color="#1E88E5"
        />
      )}

      {botTop.current.active && (
        <TrumpoTop
          position={simData.botPos}
          rpm={simData.botRpm}
          color="#E53935"
        />
      )}

      {/* Aiming Visor Guide line */}
      {isPlaying && !playerTop.current.active && (
        <group position={[-3.2, 0.1, 0]}>
          <mesh rotation={[0, -playerAngle, 0]} position={[1.0, 0, 0]}>
            <boxGeometry args={[2.0, 0.02, 0.08]} />
            <meshBasicMaterial color="#FFEB3B" opacity={0.6} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
};

const TrumpoGame = ({ mode, sessionId, gameSlug }) => {
  const { updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [scoreVal, setScoreVal] = useState(0);

  // Interface controls
  const [powerSlider, setPowerSlider] = useState(7);
  const [angleSlider, setAngleSlider] = useState(0); // in degrees: -30 to 30

  // Trigger values passed to Simulation
  const [launchPower, setLaunchPower] = useState(0);
  const [launchAngle, setLaunchAngle] = useState(0);

  const handleLaunch = () => {
    // Translate angle degrees to radians
    const rad = (angleSlider * Math.PI) / 180;
    setLaunchAngle(rad);
    setLaunchPower(powerSlider);
  };

  const handleGameOver = (result) => {
    setIsPlaying(false);
    setGameOver(true);
    setLaunchPower(0);

    if (result === 'win') {
      const finalPoints = 200 + powerSlider * 15;
      setScoreVal(finalPoints);
      updateLocalScore(finalPoints);
      setOutcome(`Panalo! Umikot ng mas matagal ang iyong trumpo. +${finalPoints} XP.`);
      finishGame(finalPoints, 'winner-user');
    } else if (result === 'lose') {
      setScoreVal(50);
      updateLocalScore(50);
      setOutcome('Talo! Huminto o tumalsik ang iyong trumpo bago ang kalaban. +50 XP.');
      finishGame(50, null);
    } else {
      setScoreVal(100);
      updateLocalScore(100);
      setOutcome('Tabla! Sabay na huminto ang inyong mga trumpo. +100 XP.');
      finishGame(100, null);
    }
  };

  const startNewGame = () => {
    setGameOver(false);
    setOutcome('');
    setLaunchPower(0);
    setLaunchAngle(0);
    setIsPlaying(true);
  };

  return (
    <ChakraBox p={6} bg="#5C3A21" color="white" minH="500px" display="flex" flexDir="column" justify="space-between">
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Trumpo 3D (Pinoy Spinning Tops)</Heading>
          <Text fontSize="xs" color="gray.300">
            I-adjust ang power at aim angle ng itatapon na trumpo. Pindutin ang LAUNCH para ibato!
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs">PUNTOS XP</Text>
            <Badge colorScheme="yellow" fontSize="lg">{scoreVal}</Badge>
          </Box>
        </HStack>
      </HStack>

      <Center flex={1} py={2} minH="340px" bg="#1F1105" borderRadius="2xl" position="relative" overflow="hidden">
        {!isPlaying ? (
          <VStack spacing={4} zIndex={5} bg="rgba(31, 17, 5, 0.9)" p={6} borderRadius="xl" border="1px solid #5C3A21" m={4}>
            {gameOver ? (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Tapos na ang Laban</Heading>
                <Text fontSize="sm" textAlign="center">{outcome}</Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Trumpo Arena</Heading>
                <Text fontSize="sm" color="gray.300" textAlign="center" maxW="sm">
                  Patalsikin ang trumpo ng kalaban o painugin ang iyo ng mas matagal upang manalo sa laban!
                </Text>
              </VStack>
            )}
            <Button colorScheme="primary" size="lg" onClick={startNewGame}>
              {gameOver ? 'Maglaro Ulit' : 'Simulan ang Laban'}
            </Button>
          </VStack>
        ) : (
          <ChakraBox w="full" h="360px" position="relative">
            <Canvas camera={{ position: [0, 8, 8], fov: 45 }} shadows>
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[5, 12, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-5, 5, -5]} intensity={0.4} />

              <TrumpoSimulation
                isPlaying={isPlaying}
                playerPower={launchPower}
                playerAngle={launchAngle}
                onGameOver={handleGameOver}
                playerCharacter={character}
              />

              <OrbitControls
                enableZoom={true}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={5}
                maxDistance={12}
              />
            </Canvas>
          </ChakraBox>
        )}
      </Center>

      {/* Adjustments Controls layout */}
      {isPlaying && launchPower === 0 && (
        <VStack spacing={4} mt={4} bg="rgba(0,0,0,0.2)" p={4} borderRadius="xl">
          <HStack w="full" spacing={6}>
            <ChakraBox flex={1}>
              <Text fontSize="xs" mb={1} color="yellow.400">Aim Direction Angle: {angleSlider}°</Text>
              <Slider
                min={-45}
                max={45}
                value={angleSlider}
                onChange={setAngleSlider}
              >
                <SliderTrack bg="gray.600"><SliderFilledTrack bg="brand.gold" /></SliderTrack>
                <SliderThumb />
              </Slider>
            </ChakraBox>
            <ChakraBox flex={1}>
              <Text fontSize="xs" mb={1} color="red.400">Launch Throw Power: {powerSlider}</Text>
              <Slider
                min={2}
                max={10}
                value={powerSlider}
                onChange={setPowerSlider}
              >
                <SliderTrack bg="gray.600"><SliderFilledTrack bg="red.500" /></SliderTrack>
                <SliderThumb />
              </Slider>
            </ChakraBox>
            <Button colorScheme="primary" size="lg" h="48px" px={8} onClick={handleLaunch}>
              LAUNCH!
            </Button>
          </HStack>
        </VStack>
      )}
    </ChakraBox>
  );
};

export default TrumpoGame;
