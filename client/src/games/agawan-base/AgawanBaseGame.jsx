import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

// Obstacles on the field
const fieldObstacles = [
  { id: 'rock1', type: 'circle', x: 0, z: -3.5, r: 1.2, color: '#90A4AE' },
  { id: 'rock2', type: 'circle', x: 0, z: 3.5, r: 1.2, color: '#90A4AE' },
  { id: 'tree_left', type: 'circle', x: -6, z: -4, r: 0.8 },
  { id: 'tree_right', type: 'circle', x: 6, z: 4, r: 0.8 },
];

const checkFieldCollision = (x, z, radius = 0.5) => {
  // Boundary limits: X [-15.5, 15.5], Z [-7.5, 7.5]
  if (x < -15.5 || x > 15.5 || z < -7.5 || z > 7.5) return true;

  for (const obs of fieldObstacles) {
    const dx = x - obs.x;
    const dz = z - obs.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < obs.r + radius) {
      return true;
    }
  }
  return false;
};

// 3D Flag/Base Post
const BaseFlag = ({ position, color }) => {
  return (
    <group position={position}>
      {/* Base Platform Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.08, 32]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Tall Pole */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3.6]} />
        <meshStandardMaterial color="#B0BEC5" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0.4, 3.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
};

// 3D Character Mesh with shield/freshness indicator
const GameCharacter = ({ position, character, freshness, rotationY = 0 }) => {
  const shieldColor = freshness > 0.6 ? '#4CAF50' : freshness > 0.3 ? '#FFEB3B' : '#F44336';
  
  return (
    <group position={[position.x, 0.6, position.z]} rotation={[0, rotationY, 0]}>
      <Character3D config={character} />

      {/* Freshness Shield indicator hovering above head */}
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 8, 32]} />
        <meshBasicMaterial color={shieldColor} />
      </mesh>
    </group>
  );
};

// 3D Environment (Field divided down the center)
const AgawanBaseField = () => {
  return (
    <group>
      {/* Grass Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[32, 16]} />
        <meshStandardMaterial color="#3E8E41" roughness={0.9} />
      </mesh>

      {/* Midfield chalk line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]}>
        <planeGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Outer borders (chalk lines) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[15.9, 16.0, 4, 1, 0, Math.PI * 2]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Fences */}
      <mesh position={[0, 0.5, -8.1]} receiveShadow castShadow>
        <boxGeometry args={[32.4, 1.0, 0.2]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[0, 0.5, 8.1]} receiveShadow castShadow>
        <boxGeometry args={[32.4, 1.0, 0.2]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[-16.1, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.0, 16.4]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[16.1, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.0, 16.4]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>

      {/* Rocks and trees */}
      {fieldObstacles.map((obs) => {
        if (obs.id.startsWith('rock')) {
          return (
            <mesh key={obs.id} position={[obs.x, 0.4, obs.z]} castShadow receiveShadow>
              <sphereGeometry args={[obs.r, 16, 16]} />
              <meshStandardMaterial color={obs.color} roughness={0.9} />
            </mesh>
          );
        } else {
          return (
            <group key={obs.id} position={[obs.x, 0, obs.z]}>
              <mesh position={[0, 1.0, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.25, 2.0]} />
                <meshStandardMaterial color="#4E342E" />
              </mesh>
              <mesh position={[0, 2.0, 0]} castShadow>
                <sphereGeometry args={[obs.r, 16, 16]} />
                <meshStandardMaterial color="#2E7D32" roughness={0.8} />
              </mesh>
            </group>
          );
        }
      })}
    </group>
  );
};

// Simulation driver to run bot AI, player controls tick, and state checks
const AgawanBaseSimulation = ({
  isPlaying,
  playerPos,
  botPos,
  playerFreshness,
  botFreshness,
  onUpdateState,
  onCapture,
  onBotCapture,
  onTag,
}) => {
  const keys = useRef({});

  // Bind keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main simulation ticks
  useFrame(() => {
    if (!isPlaying) return;

    // --- 1. Player Physics & Controls ---
    let vx = 0;
    let vz = 0;
    const speed = 0.15;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) vz = -1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) vz = 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) vx = -1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) vx = 1;

    // Diagonal speed normalization
    if (vx !== 0 && vz !== 0) {
      vx *= 0.7071;
      vz *= 0.7071;
    }

    let nextPlayerX = playerPos.x;
    let nextPlayerZ = playerPos.z;
    let playerRot = 0;

    if (vx !== 0 || vz !== 0) {
      const tryX = playerPos.x + vx * speed;
      const tryZ = playerPos.z + vz * speed;
      if (!checkFieldCollision(tryX, tryZ)) {
        nextPlayerX = tryX;
        nextPlayerZ = tryZ;
      }
      playerRot = Math.atan2(vx, vz);
    }

    // --- 2. Bot AI Navigation ---
    let botVx = 0;
    let botVz = 0;
    const botSpeed = 0.11; // Slightly slower than player for playability

    // Distance to base and player
    const distToHome = Math.sqrt(Math.pow(botPos.x - 12, 2) + Math.pow(botPos.z - 0, 2));
    const distToPlayer = Math.sqrt(Math.pow(botPos.x - playerPos.x, 2) + Math.pow(botPos.z - playerPos.z, 2));
    
    // Choose Bot State / Pathing Target
    let targetX = 12;
    let targetZ = 0;

    if (botFreshness < 0.2) {
      // Emergency: Bot needs to recharge at its red base
      targetX = 12;
      targetZ = 0;
    } else if (botFreshness > playerFreshness && distToPlayer < 6) {
      // Aggressive: Bot has higher freshness and player is close -> Chase player!
      targetX = playerPos.x;
      targetZ = playerPos.z;
    } else if (playerFreshness > botFreshness && distToPlayer < 5) {
      // Defensive/Flee: Player is fresher and close -> Bot runs back towards its base for safety
      targetX = 12;
      targetZ = 0;
    } else {
      // Capture/Sneak: Bot is fresher or safe -> Head towards player's base (blue flag)
      targetX = -12;
      targetZ = 0;
    }

    // Calculate heading vector to target
    const dx = targetX - botPos.x;
    const dz = targetZ - botPos.z;
    const distToTarget = Math.sqrt(dx * dx + dz * dz);
    let botRot = 0;

    if (distToTarget > 0.1) {
      botVx = (dx / distToTarget) * botSpeed;
      botVz = (dz / distToTarget) * botSpeed;
      botRot = Math.atan2(botVx, botVz);
    }

    let nextBotX = botPos.x + botVx;
    let nextBotZ = botPos.z + botVz;
    if (checkFieldCollision(nextBotX, nextBotZ)) {
      // If direct route hits an obstacle, slide/divert around it
      nextBotX = botPos.x + (botVz * 0.5); // simple offset slide
      nextBotZ = botPos.z - (botVx * 0.5);
    }

    // --- 3. Freshness / Energy Decay & Recharge ---
    // Touch base check
    const isPlayerInBase = Math.sqrt(Math.pow(nextPlayerX - (-12), 2) + Math.pow(nextPlayerZ - 0, 2)) < 1.5;
    const isBotInBase = Math.sqrt(Math.pow(nextBotX - 12, 2) + Math.pow(nextBotZ - 0, 2)) < 1.5;

    let nextPlayerFreshness = playerFreshness;
    if (isPlayerInBase) {
      nextPlayerFreshness = 1.0; // Instant refuel
    } else {
      nextPlayerFreshness = Math.max(0, playerFreshness - 0.002); // slowly decay
    }

    let nextBotFreshness = botFreshness;
    if (isBotInBase) {
      nextBotFreshness = 1.0;
    } else {
      nextBotFreshness = Math.max(0, botFreshness - 0.002);
    }

    // --- 4. Tag / Clash checks ---
    if (distToPlayer < 0.9) {
      if (nextPlayerFreshness > nextBotFreshness + 0.05) {
        // Player tags bot!
        onTag(true); // Player tags bot
        nextBotX = 12;
        nextBotZ = 0;
        nextBotFreshness = 1.0;
      } else if (nextBotFreshness > nextPlayerFreshness + 0.05) {
        // Bot tags player!
        onTag(false); // Bot tags player
        nextPlayerX = -12;
        nextPlayerZ = 0;
        nextPlayerFreshness = 1.0;
      }
    }

    // --- 5. Base Capture checks ---
    const capturedEnemyBase = Math.sqrt(Math.pow(nextPlayerX - 12, 2) + Math.pow(nextPlayerZ - 0, 2)) < 1.4;
    const capturedPlayerBase = Math.sqrt(Math.pow(nextBotX - (-12), 2) + Math.pow(nextBotZ - 0, 2)) < 1.4;

    if (capturedEnemyBase) {
      onCapture();
    } else if (capturedPlayerBase) {
      onBotCapture();
    }

    // Broadcast simulation state back to UI thread
    onUpdateState({
      playerPos: { x: nextPlayerX, y: 0.1, z: nextPlayerZ },
      botPos: { x: nextBotX, y: 0.1, z: nextBotZ },
      playerRot,
      botRot,
      playerFreshness: nextPlayerFreshness,
      botFreshness: nextBotFreshness,
    });
  });

  return null;
};

// Main game card component
const AgawanBaseGame = ({ mode, sessionId, gameSlug }) => {
  const { updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();
  const toast = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [scoreVal, setScoreVal] = useState(0);

  const botCharacter = {
    skinTone: 'tan',
    shirtColor: '#E53935',
    pantsColor: '#2C3E50',
    hairstyle: 'hair-curly',
    hairColor: '#3E2723',
    hat: 'bandana',
  };

  // States driving 3D render loops
  const [simState, setSimState] = useState({
    playerPos: { x: -12, y: 0.1, z: 0 },
    botPos: { x: 12, y: 0.1, z: 0 },
    playerRot: Math.PI / 2,
    botRot: -Math.PI / 2,
    playerFreshness: 1.0,
    botFreshness: 1.0,
  });

  const handleUpdateState = (nextState) => {
    setSimState(nextState);
  };

  const handleTag = (playerTaggedBot) => {
    if (playerTaggedBot) {
      setScoreVal((s) => {
        const nextScore = s + 150;
        updateLocalScore(nextScore);
        return nextScore;
      });
      toast({
        title: 'Bantay Tagged!',
        description: 'Matagumpay mong hinuli ang kalaban! +150 XP. Bumalik ito sa base.',
        status: 'success',
        duration: 2500,
        isClosable: true,
        position: 'top',
      });
    } else {
      setScoreVal((s) => {
        const nextScore = Math.max(0, s - 50);
        updateLocalScore(nextScore);
        return nextScore;
      });
      toast({
        title: 'Nataya Ka!',
        description: 'Nahuli ka ng mas bagong kalaban! -50 XP. Teleport pabalik sa iyong base.',
        status: 'error',
        duration: 2500,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleCapture = () => {
    setIsPlaying(false);
    setGameOver(true);
    const winBonus = 350;
    const finalScore = scoreVal + winBonus;
    setScoreVal(finalScore);
    updateLocalScore(finalScore);
    setOutcome(`Panalo! Matagumpay mong inagaw ang base ng kalaban! +350 XP.`);
    finishGame(finalScore, 'winner-user');
  };

  const handleBotCapture = () => {
    setIsPlaying(false);
    setGameOver(true);
    setOutcome('Talo! Naagaw ng kalaban ang iyong base habang ikaw ay wala.');
    finishGame(scoreVal, null);
  };

  const startGame = () => {
    setSimState({
      playerPos: { x: -12, y: 0.1, z: 0 },
      botPos: { x: 12, y: 0.1, z: 0 },
      playerRot: Math.PI / 2,
      botRot: -Math.PI / 2,
      playerFreshness: 1.0,
      botFreshness: 1.0,
    });
    setScoreVal(0);
    setGameOver(false);
    setOutcome('');
    setIsPlaying(true);
  };

  return (
    <Box p={6} bg="#2D3748" color="white" minH="500px" display="flex" flexDir="column" justify="space-between">
      {/* Top Header Metrics */}
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Agawan Base 3D</Heading>
          <Text fontSize="xs" color="gray.400">
            Gamitin ang <b>W,A,S,D / Arrows</b>. Tapakan ang pulang base ng kalaban para manalo!
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">SARILING ENERHIYA</Text>
            <Badge colorScheme={simState.playerFreshness > 0.5 ? 'green' : 'red'} fontSize="md">
              {Math.round(simState.playerFreshness * 100)}%
            </Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">KALABANG ENERHIYA</Text>
            <Badge colorScheme={simState.botFreshness > 0.5 ? 'green' : 'red'} fontSize="md">
              {Math.round(simState.botFreshness * 100)}%
            </Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs" color="gray.400">PUNTOS XP</Text>
            <Badge colorScheme="purple" fontSize="md">{scoreVal}</Badge>
          </Box>
        </HStack>
      </HStack>

      {/* 3D Scene Viewport */}
      <Center flex={1} py={2} minH="380px" bg="#1A202C" borderRadius="2xl" position="relative" overflow="hidden">
        {!isPlaying ? (
          <VStack spacing={4} zIndex={5} bg="rgba(26, 32, 44, 0.92)" p={6} borderRadius="xl" border="1px solid #4A5568" m={4}>
            {gameOver ? (
              <VStack spacing={2}>
                <Heading size="md" color="yellow.400">Tapos na ang Laro</Heading>
                <Text fontSize="sm" textAlign="center" maxW="sm">{outcome}</Text>
                <Text fontSize="md" fontWeight="bold">Kabuuang Puntos: {scoreVal} XP</Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Heading size="md" color="yellow.400">Agawan Base (3D Capture Base)</Heading>
                <Text fontSize="xs" color="gray.300" textAlign="center" maxW="sm">
                  <b>Panuntunan:</b> Tapakan ang iyong asul na base para mapuno ang iyong "glowing ring" ng lakas.
                  Habang ikaw ay nasa labas, ang iyong lakas ay unti-unting nababawasan. 
                  Kapag nagbanggaan kayo ng kalaban, ang may mas mataas na lakas ang tataya sa isa!
                  Tumakbo patungo sa kanang pulang base upang maagaw ito at manalo!
                </Text>
              </VStack>
            )}
            <Button colorScheme="yellow" size="lg" onClick={startGame}>
              {gameOver ? 'Maglaro Ulit' : 'Simulan ang Laban'}
            </Button>
          </VStack>
        ) : (
          <Box w="full" h="380px" position="relative">
            <Canvas camera={{ position: [0, 12, 14], fov: 40 }} shadows>
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[10, 18, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-10, 8, -5]} intensity={0.5} />

              {/* Scenery field */}
              <AgawanBaseField />

              {/* Home base flags */}
              <BaseFlag position={[-12, 0, 0]} color="#1E88E5" /> {/* Blue Player base */}
              <BaseFlag position={[12, 0, 0]} color="#E53935" />  {/* Red Bot base */}

              {/* Player Character */}
              <GameCharacter
                position={simState.playerPos}
                character={character}
                freshness={simState.playerFreshness}
                rotationY={simState.playerRot}
              />

              {/* Bot Character */}
              <GameCharacter
                position={simState.botPos}
                character={botCharacter}
                freshness={simState.botFreshness}
                rotationY={simState.botRot}
              />

              {/* Driver code runner inside render tree */}
              <AgawanBaseSimulation
                isPlaying={isPlaying}
                playerPos={simState.playerPos}
                botPos={simState.botPos}
                playerFreshness={simState.playerFreshness}
                botFreshness={simState.botFreshness}
                onUpdateState={handleUpdateState}
                onCapture={handleCapture}
                onBotCapture={handleBotCapture}
                onTag={handleTag}
              />

              <OrbitControls
                enableZoom={true}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={10}
                maxDistance={22}
              />
            </Canvas>
          </Box>
        )}
      </Center>

      {/* Guide details */}
      {isPlaying && (
        <Center mt={2}>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Gabay: Bumalik at tapakan ang iyong asul na bilog upang mag-recharge kapag mababa na ang iyong enerhiya!
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default AgawanBaseGame;
