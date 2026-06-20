import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  Badge,
  useToast,
  Center,
} from '@chakra-ui/react';
import useGame from '../../hooks/useGame';
import useAuth from '../../hooks/useAuth';

const cardPresets = [
  { id: 'teks-darna', name: 'Darna', desc: 'Pinoy Superheroine', image: '🦸‍♀️' },
  { id: 'teks-panday', name: 'Ang Panday', desc: 'Sword-wielding Legend', image: '🗡️' },
  { id: 'teks-captain', name: 'Captain Barbell', desc: 'Strength & Power', image: '🏋️‍♂️' },
  { id: 'teks-gagamboy', name: 'Gagamboy', desc: 'Spider Powers', image: '🕷️' },
];

const TeksGame = ({ mode, sessionId, gameSlug }) => {
  const { user } = useAuth();
  const { score, opponentScore, updateLocalScore, sendGameAction, finishGame } = useGame(sessionId);
  const toast = useToast();

  const [hand, setHand] = useState(cardPresets);
  const [selectedCard, setSelectedCard] = useState(null);
  const [betStyle, setBetStyle] = useState('laban'); // 'laban' (different wins) or 'pareho' (same wins)
  const [gameState, setGameState] = useState('idle'); // 'idle', 'betting', 'flipping', 'result'
  
  // Game states
  const [playerCardFace, setPlayerCardFace] = useState('up'); // 'up' or 'down'
  const [opponentCardFace, setOpponentCardFace] = useState('up');
  const [outcome, setOutcome] = useState('');
  
  // Local points (cards won)
  const [myCardsCount, setMyCardsCount] = useState(10);
  const [oppCardsCount, setOppCardsCount] = useState(10);

  useEffect(() => {
    if (gameState === 'flipping') {
      const timer = setTimeout(() => {
        resolveFlip();
      }, 2000); // 2s tumbling animation
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const selectCard = (card) => {
    if (gameState !== 'idle') return;
    setSelectedCard(card);
    setGameState('betting');
  };

  const startFlip = () => {
    setGameState('flipping');
    // Randomize final landing faces
    setPlayerCardFace(Math.random() > 0.5 ? 'up' : 'down');
    setOpponentCardFace(Math.random() > 0.5 ? 'up' : 'down');
  };

  const resolveFlip = () => {
    // Check outcome
    // Laban: If face up & face down -> Caller wins. If same -> Opponent wins.
    // Pareho: If same -> Caller wins. If different -> Opponent wins.
    const isSame = playerCardFace === opponentCardFace;
    let won = false;

    if (betStyle === 'pareho') {
      won = isSame;
    } else {
      // 'laban' (different wins)
      won = !isSame;
    }

    if (won) {
      setMyCardsCount((c) => c + 1);
      setOppCardsCount((c) => c - 1);
      setOutcome('Ikaw ang nanalo sa flip na ito!');
      updateLocalScore(score + 10); // add XP score
    } else {
      setMyCardsCount((c) => c - 1);
      setOppCardsCount((c) => c + 1);
      setOutcome('Natalo ka sa flip na ito.');
    }

    setGameState('result');

    // End condition
    if (myCardsCount <= 1 || oppCardsCount <= 1) {
      const winner = myCardsCount > oppCardsCount ? user?._id : 'bot';
      finishGame(score, winner);
    }
  };

  const resetFlip = () => {
    setSelectedCard(null);
    setGameState('idle');
  };

  return (
    <Box p={6} bg="#2C3E50" color="white" minH="450px" display="flex" flexDir="column" justify="space-between">
      {/* HUD Panel */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start">
          <Heading size="md">Teks Card Game</Heading>
          <Text fontSize="xs" color="gray.300">I-flick ang iyong card para tumumba at tumugma!</Text>
        </VStack>
        <HStack spacing={6}>
          <Box textAlign="center">
            <Text fontSize="2xs">IYONG TEKS DECK</Text>
            <Badge colorScheme="green" fontSize="md">{myCardsCount} Cards</Badge>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xs">KALABAN DECK</Text>
            <Badge colorScheme="red" fontSize="md">{oppCardsCount} Cards</Badge>
          </Box>
        </HStack>
      </HStack>

      {/* Main Board Area */}
      <Center flex={1} py={4}>
        {gameState === 'idle' && (
          <VStack spacing={4} w="full">
            <Text fontWeight="bold">Pumili ng card na ihahagis mula sa iyong deck:</Text>
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4} w="full">
              {hand.map((card) => (
                <Button
                  key={card.id}
                  onClick={() => selectCard(card)}
                  h="120px"
                  variant="secondary"
                  flexDir="column"
                  p={4}
                  _hover={{ borderColor: 'brand.gold', transform: 'translateY(-2px)' }}
                >
                  <Text fontSize="3xl" mb={1}>{card.image}</Text>
                  <Text fontWeight="bold" fontSize="sm">{card.name}</Text>
                  <Text fontSize="2xs" color="gray.500">{card.desc}</Text>
                </Button>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {gameState === 'betting' && (
          <VStack spacing={6}>
            <Text fontWeight="bold">Pumili ng taya ng Laban (Bet Style):</Text>
            <HStack spacing={6}>
              <Button
                size="lg"
                colorScheme={betStyle === 'laban' ? 'yellow' : 'gray'}
                onClick={() => setBetStyle('laban')}
              >
                Laban (Iba ang Mukha)
              </Button>
              <Button
                size="lg"
                colorScheme={betStyle === 'pareho' ? 'yellow' : 'gray'}
                onClick={() => setBetStyle('pareho')}
              >
                Pareho (Parehong Mukha)
              </Button>
            </HStack>
            <Button colorScheme="primary" size="lg" onClick={startFlip} px={10}>
              I-flick ang Teks!
            </Button>
          </VStack>
        )}

        {gameState === 'flipping' && (
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">Nasa Hangin ang mga Teks...</Text>
            <HStack spacing={8} className="anim-spin-slow">
              <Box w="80px" h="120px" bg="brand.gold" borderRadius="lg" border="4px solid white" />
              <Box w="80px" h="120px" bg="brand.red" borderRadius="lg" border="4px solid white" />
            </HStack>
          </VStack>
        )}

        {gameState === 'result' && (
          <VStack spacing={6}>
            <HStack spacing={8} align="center">
              <VStack>
                <Text fontSize="xs">IYONG CARD ({playerCardFace.toUpperCase()})</Text>
                <Box
                  w="90px"
                  h="130px"
                  bg="brand.gold"
                  borderRadius="lg"
                  border="4px solid"
                  borderColor="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="4xl"
                  transform={playerCardFace === 'down' ? 'rotateY(180deg)' : 'none'}
                  transition="transform 0.5s"
                >
                  {playerCardFace === 'up' ? selectedCard?.image : '🇵🇭'}
                </Box>
              </VStack>
              <Text fontSize="3xl" fontWeight="black" color="brand.red">VS</Text>
              <VStack>
                <Text fontSize="xs">KALABAN CARD ({opponentCardFace.toUpperCase()})</Text>
                <Box
                  w="90px"
                  h="130px"
                  bg="brand.red"
                  borderRadius="lg"
                  border="4px solid"
                  borderColor="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="4xl"
                  transform={opponentCardFace === 'down' ? 'rotateY(180deg)' : 'none'}
                  transition="transform 0.5s"
                >
                  {opponentCardFace === 'up' ? '🦸‍♂️' : '🇵🇭'}
                </Box>
              </VStack>
            </HStack>

            <VStack spacing={2}>
              <Heading size="md" color="brand.gold">{outcome}</Heading>
              <Text fontSize="sm" color="gray.400">
                Pumili ka ng: <Badge colorScheme="purple">{betStyle.toUpperCase()}</Badge>
              </Text>
            </VStack>

            <Button colorScheme="primary" onClick={resetFlip} size="md">
              Maglaro Ulit
            </Button>
          </VStack>
        )}
      </Center>
    </Box>
  );
};

export default TeksGame;
