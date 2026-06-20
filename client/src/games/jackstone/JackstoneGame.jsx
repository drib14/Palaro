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
  useToast,
} from '@chakra-ui/react';
import * as THREE from 'three';
import useGame from '../../hooks/useGame';
import useCharacter from '../../hooks/useCharacter';
import Character3D from '../../components/Character/Character3D';

// 3D Metal Jack Piece component
const JackPiece = ({ position, active, visible, onClick }) => {
  if (!visible) return null;

  return (
    <group position={position} onClick={onClick}>
      {/* 3 intersecting shafts representing the jack star shape */}
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
        <meshStandardMaterial
          color={active ? '#FFD54F' : '#ECEFF1'}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
        <meshStandardMaterial
          color={active ? '#FFD54F' : '#ECEFF1'}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
        <meshStandardMaterial
          color={active ? '#FFD54F' : '#ECEFF1'}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Small spheres on ends */}
      <mesh position={[0, 0.16, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={active ? '#FFEB3B' : '#78909C'} /></mesh>
      <mesh position={[0, -0.16, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={active ? '#FFEB3B' : '#78909C'} /></mesh>
      <mesh position={[0.16, 0, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={active ? '#FFEB3B' : '#78909C'} /></mesh>
      <mesh position={[-0.16, 0, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={active ? '#FFEB3B' : '#78909C'} /></mesh>
    </group>
  );
};

// Physics driver component running inside Canvas
const JackstoneSimulation = ({
  isPlaying,
  ballState,
  jacksList,
  onCollectJack,
  onTick,
  playerCharacter,
}) => {
  useFrame((state) => {
    if (!isPlaying) return;

    // Run physics updates and push ticks back to parent state
    onTick();
  });

  return (
    <group>
      {/* Wooden Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>

      {/* Scattered Jack pieces */}
      {jacksList.map((j) => (
        <JackPiece
          key={j.id}
          position={[j.x, 0.05, j.z]}
          active={j.active}
          visible={j.visible}
          onClick={() => onCollectJack(j.id)}
        />
      ))}

      {/* Red rubber ball */}
      {ballState.visible && (
        <mesh position={[ballState.x, ballState.y, ballState.z]} castShadow>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial color="#E53935" roughness={0.1} metalness={0.1} />
        </mesh>
      )}

      {/* Sitting player character */}
      <group position={[0, 0.35, 3.8]} rotation={[0, Math.PI, 0]}>
        <Character3D config={playerCharacter} />
      </group>
    </group>
  );
};

const JackstoneGame = ({ mode, sessionId, gameSlug }) => {
  const { updateLocalScore, finishGame } = useGame(sessionId);
  const { character } = useCharacter();
  const toast = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [scoreVal, setScoreVal] = useState(0);

  // Jackstone rules state
  const [roundLevel, setRoundLevel] = useState(1); // Onesies (1), Twosies (2), etc.
  const [collectedCount, setCollectedCount] = useState(0);

  // Ball physics state
  const [ball, setBall] = useState({
    x: 0,
    y: 0.18,
    z: 1.5,
    vy: 0,
    visible: true,
    hasBounced: false,
  });

  // Jacks state list
  const [jacks, setJacks] = useState([]);
  const [gamePhase, setGamePhase] = useState('idle'); // idle, throwing, bounced, caught, failed

  const ballRef = useRef(ball);
  const phaseRef = useRef(gamePhase);
  const roundRef = useRef(roundLevel);

  useEffect(() => {
    ballRef.current = ball;
  }, [ball]);

  useEffect(() => {
    phaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    roundRef.current = roundLevel;
  }, [roundLevel]);

  // Launch a new round / scatter jacks
  const resetRound = (level) => {
    const list = [];
    // Spread 10 jacks in a grid cluster
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10;
      const r = 1.0 + Math.random() * 1.5;
      list.push({
        id: i,
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r - 0.5,
        visible: true,
        active: false,
      });
    }
    // Set a few jacks active based on round level
    for (let i = 0; i < level; i++) {
      if (list[i]) list[i].active = true;
    }

    setJacks(list);
    setCollectedCount(0);
    setBall({ x: 0, y: 0.18, z: 1.5, vy: 0, visible: true, hasBounced: false });
    setGamePhase('aim');
  };

  // Keyboard space catcher listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;

      if (e.code === 'Space') {
        e.preventDefault();
        
        const phase = phaseRef.current;
        if (phase === 'aim') {
          // Throw the ball
          setBall((b) => ({ ...b, vy: 5.5, hasBounced: false }));
          setGamePhase('throwing');
        } else if (phase === 'throwing' || phase === 'bounced') {
          // Attempt catch
          const b = ballRef.current;
          // Catch zone: height between 0.15 and 1.6
          const inCatchZone = b.y >= 0.15 && b.y <= 1.6;
          
          if (inCatchZone) {
            handleCatchSuccess();
          } else {
            handleCatchFail('Sinalo ng labas sa tamang taas!');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleCollectJack = (id) => {
    if (!isPlaying) return;
    const phase = phaseRef.current;
    
    // Can only pick up jacks when ball is in the air
    if (phase !== 'throwing' && phase !== 'bounced') return;

    setJacks((prev) => {
      const target = prev.find((j) => j.id === id);
      if (!target || !target.active || !target.visible) return prev;

      // Pick it up (make it invisible)
      const nextList = prev.map((j) => (j.id === id ? { ...j, visible: false, active: false } : j));
      
      // Select next target jack active to help user
      const remainingActive = nextList.filter((j) => j.active && j.visible).length;
      setCollectedCount((c) => {
        const nextCollect = c + 1;
        if (nextCollect === roundRef.current) {
          // Collected all required jacks for this bounce catch attempt!
        }
        return nextCollect;
      });

      return nextList;
    });
  };

  const handleCatchSuccess = () => {
    const list = jacks.filter(j => j.active && j.visible);
    if (collectedCount >= roundLevel) {
      // Round clear success!
      toast({
        title: 'Sinalo!',
        description: `Matagumpay na sinalo ang bola! Round level cleared.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      setScoreVal((s) => {
        const nextScore = s + roundLevel * 100;
        updateLocalScore(nextScore);
        return nextScore;
      });

      if (roundLevel === 4) {
        // Complete game victory
        setIsPlaying(false);
        setGameOver(true);
        const winScore = scoreVal + 500;
        setScoreVal(winScore);
        updateLocalScore(winScore);
        setOutcome(`Binabati kita! Nakumpleto mo ang Jackstone 3D Challenges! Puntos: ${winScore} XP.`);
        finishGame(winScore, 'winner-user');
      } else {
        // Next round level
        const nextLvl = roundLevel + 1;
        setRoundLevel(nextLvl);
        resetRound(nextLvl);
      }
    } else {
      handleCatchFail('Kulang ang napulot na Jacks!');
    }
  };

  const handleCatchFail = (msg = 'Bumagsak ang bola!') => {
    setIsPlaying(false);
    setGameOver(true);
    setOutcome(`Talo! ${msg} Nakuhang puntos: ${scoreVal} XP.`);
    finishGame(scoreVal, null);
  };

  // Tick updates called inside R3F render frame loops
  const handleTick = () => {
    setBall((b) => {
      if (b.vy === 0 && b.y === 0.18) return b; // idle

      let nextVy = b.vy - 0.12; // gravity pull
      let nextY = b.y + nextVy * 0.16;
      let nextBounced = b.hasBounced;

      // Bounce on table surface
      if (nextY <= 0.18) {
        nextY = 0.18;
        if (!b.hasBounced) {
          nextVy = -nextVy * 0.8; // elastic coefficient bounce
          nextBounced = true;
          setGamePhase('bounced');
        } else {
          // Ball fell off second time - missed!
          nextVy = 0;
          setIsPlaying(false);
          setGameOver(true);
          setOutcome(`Talo! Nalaglag o tumalbog ang bola ng higit sa isang beses.`);
          finishGame(scoreVal, null);
        }
      }

      return {
        ...b,
        y: nextY,
        vy: nextVy,
        hasBounced: nextBounced,
      };
    });
  };

  const startNewGame = () => {
    setRoundLevel(1);
    setScoreVal(0);
    setGameOver(false);
    setOutcome('');
    setIsPlaying(true);
    resetRound(1);
  };

  const catchIndicatorBg = () => {
    const y = ball.y;
    return y >= 0.15 && y <= 1.6 ? 'green.500' : 'red.500';
  };

  return (
    <ChakraBox p={6} bg="#5C3A21" color="white" minH="500px" display="flex" flexDir="column" justify="space-between">
      <HStack justify="space-between" mb={4}>
        <VStack align="start">
          <Heading size="md">Jackstone 3D (Pinoy Jacks)</Heading>
          <Text fontSize="xs" color="gray.300">
            Pindutin ang <b>SPACE</b> para ibato. I-click ang mga dilaw na jacks habang lumilipad ang bola, at pindutin ulit ang <b>SPACE</b> para saluhin!
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xs">ROUND LEVEL</Text>
            <Badge colorScheme="green" fontSize="md">LEVEL {roundLevel} ({roundLevel === 1 ? 'Onesies' : roundLevel === 2 ? 'Twosies' : roundLevel === 3 ? 'Threesies' : 'Foursies'})</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs">NAPULOT NA JACKS</Text>
            <Badge colorScheme="yellow" fontSize="md">{collectedCount} / {roundLevel}</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs">PUNTOS XP</Text>
            <Badge colorScheme="purple" fontSize="md">{scoreVal}</Badge>
          </Box>
        </HStack>
      </HStack>

      <Center flex={1} py={2} minH="340px" bg="#1F1105" borderRadius="2xl" position="relative" overflow="hidden">
        {!isPlaying ? (
          <VStack spacing={4} zIndex={5} bg="rgba(31, 17, 5, 0.9)" p={6} borderRadius="xl" border="1px solid #5C3A21" m={4}>
            {gameOver ? (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Tapos na ang Laro</Heading>
                <Text fontSize="sm" textAlign="center">{outcome}</Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Heading size="md" color="brand.gold">Jackstone Challenge</Heading>
                <Text fontSize="xs" color="gray.300" textAlign="center" maxW="sm">
                  Kailangan mong mai-toss ang pulang bola at makuha ang kumikinang na jacks sa table bago saluhin ang bola sa tamang taas.
                </Text>
              </VStack>
            )}
            <Button colorScheme="primary" size="lg" onClick={startNewGame}>
              {gameOver ? 'Maglaro Ulit' : 'Simulan ang Laro'}
            </Button>
          </VStack>
        ) : (
          <ChakraBox w="full" h="360px" position="relative">
            <Canvas camera={{ position: [0, 4, 5.5], fov: 40 }} shadows>
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[5, 12, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-5, 5, -5]} intensity={0.4} />

              <JackstoneSimulation
                isPlaying={isPlaying}
                ballState={ball}
                jacksList={jacks}
                onCollectJack={handleCollectJack}
                onTick={handleTick}
                playerCharacter={character}
              />

              <OrbitControls
                enableZoom={true}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={4}
                maxDistance={8}
              />
            </Canvas>

            {/* Float HUD Catch visual assistance */}
            <ChakraBox
              position="absolute"
              top={4}
              right={4}
              bg="rgba(0,0,0,0.6)"
              p={3}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.700"
            >
              <Text fontSize="2xs" color="gray.300">CATCH HEIGHT GUIDE</Text>
              <HStack spacing={2} mt={1}>
                <ChakraBox w="12px" h="12px" borderRadius="full" bg={catchIndicatorBg()} />
                <Text fontSize="xs" fontWeight="bold">
                  {ball.y > 1.6 ? 'TTOO HIGH' : ball.y < 0.15 && ball.vy !== 0 ? 'TOO LOW' : 'READY TO CATCH!'}
                </Text>
              </HStack>
            </ChakraBox>
          </ChakraBox>
        )}
      </Center>

      {/* Rhythmic hints layout */}
      {isPlaying && (
        <Center mt={4}>
          <Text fontSize="xs" color="gray.400">
            Tip: Pindutin ang Spacebar kapag ang Catch Height Guide ay kulay berde upang saluhin ang bola.
          </Text>
        </Center>
      )}
    </ChakraBox>
  );
};

export default JackstoneGame;
