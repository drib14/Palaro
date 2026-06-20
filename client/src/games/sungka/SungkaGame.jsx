import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  VStack,
  HStack,
  Heading,
  useToast,
  Center,
  Grid,
  Badge,
} from '@chakra-ui/react';
import useGame from '../../hooks/useGame';
import useAuth from '../../hooks/useAuth';

const SungkaGame = ({ mode, sessionId, gameSlug }) => {
  const { user } = useAuth();
  const { score, opponentScore, updateLocalScore, sendGameAction, activeSession, finishGame } = useGame(sessionId);
  const toast = useToast();

  // Board state:
  // pits: array of 14 small pits. Indexes 0-6 (bottom/Player 1), 7-13 (top/Player 2)
  // head1: Player 1 large pit (left side)
  // head2: Player 2 large pit (right side)
  const [pits, setPits] = useState(Array(14).fill(7));
  const [head1, setHead1] = useState(0);
  const [head2, setHead2] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Iyong tira! Pumili ng pit.');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle PVP socket actions
  useEffect(() => {
    if (mode === 'pvp') {
      // Set who starts. Host is first player in players array.
      const isHost = activeSession?.players[0]?.userId === user?._id;
      setIsPlayerTurn(isHost);
      setStatusMessage(isHost ? 'Iyong tira! Pumili ng pit.' : 'Tira ng kalaban...');
    }
  }, [mode, activeSession, user]);

  // Handle opponent move in PVP
  useEffect(() => {
    if (mode === 'pvp') {
      const handleAction = ({ action, data }) => {
        if (action === 'sungka_move') {
          simulateSowing(data.pitIndex, false);
        }
      };
      
      // Let's hook it up using standard game:action listener from useGame if available
      // Or we can register a custom listener on the socket directly
    }
  }, [mode]);

  // Check game over
  useEffect(() => {
    // Game over when all pits are empty
    const player1PitsEmpty = pits.slice(0, 7).every(p => p === 0);
    const player2PitsEmpty = pits.slice(7, 14).every(p => p === 0);

    if (player1PitsEmpty && player2PitsEmpty && !isAnimating) {
      const winnerId = head1 > head2 ? user?._id : 'opponent';
      setStatusMessage(`Tapos na ang laro! ${head1 > head2 ? 'Ikaw ang panalo!' : 'Natalo ka.'}`);
      finishGame(head1, head1 > head2 ? user?._id : null);
    }
  }, [pits, head1, head2, isAnimating]);

  // PVC Bot Turn
  useEffect(() => {
    if (mode === 'pvc' && !isPlayerTurn && !isAnimating) {
      setStatusMessage('Computer ay nag-iisip...');
      const timer = setTimeout(() => {
        makeBotMove();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, isAnimating, mode]);

  // Sowing simulator (sow shell pieces counter-clockwise)
  const simulateSowing = async (startPit, isLocalUser) => {
    setIsAnimating(true);
    let currentPits = [...pits];
    let currentHead1 = head1;
    let currentHead2 = head2;

    let hand = currentPits[startPit];
    currentPits[startPit] = 0;
    setPits([...currentPits]);

    let currIdx = startPit;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    while (hand > 0) {
      currIdx = (currIdx + 1) % 15; // 0-13 small pits, 14 head1, 15 head2 equivalent logic
      
      // Sowing rule: skip opponent's head pit
      if (currIdx === 7 && isLocalUser) {
        // Skip player 2 head if Player 1 is playing (let's map index 14 for P1 head, 15 for P2 head)
      }

      // To simplify sowing circular indexing:
      // Pits flow: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> [Head1] -> 13 -> 12 -> 11 -> 10 -> 9 -> 8 -> 7 -> [Head2]
      // Let's create a custom route path for counter-clockwise:
      // Player 1 side: 0 to 6. Player 1 head. Player 2 side: 13 to 7 (backwards). Player 2 head.
      // Sowing path: [0, 1, 2, 3, 4, 5, 6, 'H1', 13, 12, 11, 10, 9, 8, 7, 'H2']
      // Let's find index in path:
    }

    // A simpler board distribution logic for Sungka:
    let tempPits = [...pits];
    let h1 = head1;
    let h2 = head2;
    let count = tempPits[startPit];
    tempPits[startPit] = 0;
    
    let position = startPit;
    let turnOver = false;

    while (count > 0) {
      position = (position + 1) % 16; // 14 small pits + 2 head pits (pos 7 is H1, pos 15 is H2)
      
      // Skip opponent's head
      if (position === 7 && !isLocalUser) continue; // Skip P1 head for P2
      if (position === 15 && isLocalUser) continue; // Skip P2 head for P1

      if (position === 7) {
        h1++;
      } else if (position === 15) {
        h2++;
      } else {
        // Map 0-13 small pits
        const smallIdx = position > 7 ? position - 1 : position;
        tempPits[smallIdx]++;
      }
      
      count--;
      setPits([...tempPits]);
      setHead1(h1);
      setHead2(h2);
      await delay(250); // sowing animation interval
    }

    // Check last shell land rules
    const finalPos = position;
    if (finalPos === 7 && isLocalUser) {
      // Lands in own head -> Extra Turn!
      setStatusMessage('Karagdagang tira! Tira mo ulit.');
      setIsPlayerTurn(true);
    } else if (finalPos === 15 && !isLocalUser) {
      // Bot lands in own head -> Bot gets another turn
      setStatusMessage('Computer ay may karagdagang tira.');
      setIsPlayerTurn(false);
    } else {
      // Lands in small pit
      const smallIdx = finalPos > 7 ? finalPos - 1 : finalPos;
      const landedSeeds = tempPits[smallIdx];

      if (landedSeeds > 1) {
        // Occupied pit -> sow again! (recursive play)
        setStatusMessage('Nagpatuloy ang pag-sow...');
        await delay(300);
        simulateSowing(smallIdx, isLocalUser);
        return; // wait for recursive play to finish animating
      } else {
        // Lands in empty pit -> turn ends
        // Capture rule: if it lands on your own side's empty pit and opposite has shells, capture both
        const isOwnSide = isLocalUser ? (smallIdx >= 0 && smallIdx <= 6) : (smallIdx >= 7 && smallIdx <= 13);
        const oppositeIdx = 13 - smallIdx;
        
        if (isOwnSide && tempPits[oppositeIdx] > 0) {
          setStatusMessage('Nakuha (Capture)!');
          const captured = tempPits[oppositeIdx] + 1;
          tempPits[smallIdx] = 0;
          tempPits[oppositeIdx] = 0;
          
          if (isLocalUser) {
            h1 += captured;
            setHead1(h1);
          } else {
            h2 += captured;
            setHead2(h2);
          }
          setPits([...tempPits]);
          await delay(300);
        }

        // Switch turn
        setIsPlayerTurn(!isLocalUser);
        setStatusMessage(isLocalUser ? 'Tira ng kalaban...' : 'Iyong tira! Pumili ng pit.');
      }
    }

    setIsAnimating(false);
    // Update score hooks
    if (isLocalUser) {
      updateLocalScore(h1);
    }
  };

  const handlePitClick = (index) => {
    if (!isPlayerTurn || isAnimating || pits[index] === 0) return;
    
    // User can only play pits on their side (0 to 6)
    if (index < 0 || index > 6) return;

    if (mode === 'pvp' && socket) {
      sendGameAction('sungka_move', { pitIndex: index });
    }

    simulateSowing(index, true);
  };

  const makeBotMove = () => {
    // Choose best pit (heuristics: prefer pit that lets it play again, or has most seeds)
    const botPits = pits.slice(7, 14);
    const validIndexes = [];
    botPits.forEach((seeds, i) => {
      if (seeds > 0) validIndexes.push(i + 7);
    });

    if (validIndexes.length === 0) {
      setIsPlayerTurn(true);
      return;
    }

    // Heuristics: find one that lands exactly in head2 (position 15)
    // Distance to head2: (15 - position)
    let selectedPit = validIndexes[0];
    for (const idx of validIndexes) {
      const seeds = pits[idx];
      // if seeds can reach head2 exactly
      if ((idx + seeds) % 16 === 15) {
        selectedPit = idx;
        break;
      }
    }

    // fallback select largest
    if (selectedPit === null) {
      selectedPit = validIndexes.reduce((maxIdx, currIdx) => 
        pits[currIdx] > pits[maxIdx] ? currIdx : maxIdx
      , validIndexes[0]);
    }

    simulateSowing(selectedPit, false);
  };

  return (
    <Box p={6} bg="#5C3A21" color="white" minH="450px" display="flex" flexDir="column" justify="space-between">
      {/* HUD info */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start">
          <Text fontWeight="bold">Mahogany Board (Sungkaan)</Text>
          <Badge colorScheme="yellow">{statusMessage}</Badge>
        </VStack>
        <HStack spacing={6}>
          <Box textAlign="center">
            <Text fontSize="xs">IYONG SHELLS</Text>
            <Heading size="md" color="brand.gold">{head1}</Heading>
          </Box>
          <Box textAlign="center">
            <Text fontSize="xs">KALABAN SHELLS</Text>
            <Heading size="md" color="brand.red">{head2}</Heading>
          </Box>
        </HStack>
      </HStack>

      {/* Main Board Grid representation */}
      <Box bg="#3D2513" p={6} borderRadius="3xl" border="4px solid #2B190C" boxShadow="inset 0 10px 20px rgba(0,0,0,0.5)">
        <Grid templateColumns="80px 1fr 80px" gap={4} alignItems="center">
          {/* Player 1 Head (Left side) */}
          <Center h="120px" bg="#1A0D06" borderRadius="full" border="2px solid #5C3A21" boxShadow="inner">
            <VStack spacing={1}>
              <Text fontSize="2xs" color="gray.400">ULO A</Text>
              <Heading size="md" color="brand.gold">{head1}</Heading>
            </VStack>
          </Center>

          {/* Small Pits Columns (2 rows of 7 pits) */}
          <VStack spacing={6} w="full">
            {/* Top row (Player 2/Bot, index 7 to 13 - shown right-to-left) */}
            <HStack spacing={3} justify="space-around" w="full">
              {pits.slice(7, 14).reverse().map((seeds, index) => {
                const actualIndex = 13 - index;
                return (
                  <Center
                    key={actualIndex}
                    w="45px"
                    h="45px"
                    bg="#1A0D06"
                    borderRadius="full"
                    border="2px solid #2B190C"
                    position="relative"
                  >
                    <Text fontSize="md" fontWeight="bold">{seeds}</Text>
                  </Center>
                );
              })}
            </HStack>

            {/* Bottom row (Player 1/User, index 0 to 6 - left-to-right) */}
            <HStack spacing={3} justify="space-around" w="full">
              {pits.slice(0, 7).map((seeds, index) => (
                <Center
                  key={index}
                  w="45px"
                  h="45px"
                  bg="#1A0D06"
                  borderRadius="full"
                  border="2px solid"
                  borderColor={isPlayerTurn && seeds > 0 ? 'brand.gold' : '#2B190C'}
                  cursor={isPlayerTurn && seeds > 0 && !isAnimating ? 'pointer' : 'default'}
                  onClick={() => handlePitClick(index)}
                  _hover={isPlayerTurn && seeds > 0 && !isAnimating ? { bg: '#2B190C', borderColor: 'brand.gold' } : {}}
                  transition="all 0.2s"
                >
                  <Text fontSize="md" fontWeight="bold" color={isPlayerTurn && seeds > 0 ? 'brand.gold' : 'white'}>
                    {seeds}
                  </Text>
                </Center>
              ))}
            </HStack>
          </VStack>

          {/* Player 2 Head (Right side) */}
          <Center h="120px" bg="#1A0D06" borderRadius="full" border="2px solid #5C3A21" boxShadow="inner">
            <VStack spacing={1}>
              <Text fontSize="2xs" color="gray.400">ULO B</Text>
              <Heading size="md" color="brand.red">{head2}</Heading>
            </VStack>
          </Center>
        </Grid>
      </Box>

      {/* Instructions */}
      <Center mt={6}>
        <Text fontSize="xs" color="gray.400">
          I-click ang kahit anong pit sa ibabang linya na may laman para mag-sow counter-clockwise.
        </Text>
      </Center>
    </Box>
  );
};

export default SungkaGame;
