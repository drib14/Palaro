import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Stack,
  Button,
  Card,
  CardBody,
  HStack,
  VStack,
  Icon,
  Badge,
  useColorModeValue,
  Progress,
  List,
  ListItem,
  ListIcon,
  Center,
  GridItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import useAuth from '../hooks/useAuth';
import useGame from '../hooks/useGame';
import useGameStore from '../store/gameStore';
import { LucideGamepad2, LucideSparkles, LucideMapPin, LucideShieldCheck, LucideQuote, LucideUsers2 } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { games, fetchGames } = useGameStore();
  const [challenges, setChallenges] = useState([]);
  const [recentMemories, setRecentMemories] = useState([]);
  const [stats, setStats] = useState({ gamesPlayed: 0, totalWins: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();

    // Fetch active challenges
    const getChallenges = async () => {
      try {
        const res = await api.get('/challenges/active');
        if (res.data.success) setChallenges(res.data.challenges || []);
      } catch (err) {
        console.warn('Failed to load active challenges');
      }
    };

    // Fetch recent memories
    const getMemories = async () => {
      try {
        const res = await api.get('/memories?limit=3');
        if (res.data.success) setRecentMemories(res.data.data?.memories || []);
      } catch (err) {
        console.warn('Failed to load recent memories');
      }
    };

    // Fetch user game stats
    const getStats = async () => {
      try {
        const res = await api.get('/collection');
        if (res.data.success && Array.isArray(res.data.entries)) {
          const played = res.data.entries.reduce((acc, curr) => acc + curr.totalTimesPlayed, 0);
          setStats({ gamesPlayed: played, totalWins: Math.floor(played * 0.45) }); // mock wins ratio from played
        }
      } catch (err) {
        console.warn('Failed to load collection stats');
      }
    };

    getChallenges();
    getMemories();
    getStats();
  }, [fetchGames]);

  const welcomeBg = useColorModeValue(
    'linear-gradient(to-r, #F7B731, #E74C3C)',
    'linear-gradient(to-r, #161b22, #10151B)'
  );

  const welcomeColor = useColorModeValue('brand.nightMarket', 'white');

  // filter down to priority games
  const priorityGames = games.filter(g => ['sungka', 'patintero', 'teks', 'sipa'].includes(g.slug));

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        {/* Welcome Banner */}
        <Card bg={welcomeBg} border="none" color={welcomeColor} overflow="hidden">
          <CardBody py={8} px={8}>
            <SimpleGrid columns={{ base: 1, md: 12 }} alignItems="center">
              <GridItem colSpan={{ base: 1, md: 8 }}>
                <Stack spacing={2}>
                  <Badge alignSelf="flex-start" colorScheme="yellow" fontSize="xs">
                    {user?.province ? `Representing ${user.province}` : 'No Province Set'}
                  </Badge>
                  <Heading size="xl" fontFamily="heading" fontWeight="extrabold">
                    Kumusta, {user?.username}!
                  </Heading>
                  <Text fontSize="md" maxW="lg" opacity={0.9}>
                    Maligayang pagdating sa Palaro! Ang social playground para sa mga paborito nating larong kalye. Sumali sa Virtual Playground o simulan ang laban!
                  </Text>
                </Stack>
                <HStack spacing={4} mt={6}>
                  <Button
                    size="lg"
                    bg="brand.gold"
                    color="brand.nightMarket"
                    leftIcon={<LucideSparkles size={18} />}
                    onClick={() => navigate('/playground')}
                    _hover={{ bg: '#ffd05c' }}
                  >
                    Virtual Playground
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    leftIcon={<LucideGamepad2 size={18} />}
                    onClick={() => navigate('/games')}
                  >
                    Maglaro ng Laro
                  </Button>
                </HStack>
              </GridItem>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card>
            <CardBody py={4} textAlign="center">
              <Text fontSize="sm" color="gray.500" fontWeight="bold">LEVEL</Text>
              <Heading size="lg" color="brand.gold">{user?.level || 1}</Heading>
              <Progress value={(user?.xp % 1000) / 10} size="xs" colorScheme="yellow" mt={2} borderRadius="full" />
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4} textAlign="center">
              <Text fontSize="sm" color="gray.500" fontWeight="bold">LARONG NALARUAN</Text>
              <Heading size="lg" color="brand.blue">{stats.gamesPlayed}</Heading>
              <Text fontSize="xs" color="gray.500" mt={2}>Total plays recorded</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4} textAlign="center">
              <Text fontSize="sm" color="gray.500" fontWeight="bold">PANALO</Text>
              <Heading size="lg" color="brand.green">{stats.totalWins}</Heading>
              <Text fontSize="xs" color="gray.500" mt={2}>Estimated matches won</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4} textAlign="center">
              <Text fontSize="sm" color="gray.500" fontWeight="bold">PROBINSYA POINTS</Text>
              <Heading size="lg" color="brand.red">{stats.totalWins * 10}</Heading>
              <Text fontSize="xs" color="gray.500" mt={2}>Points earned for province</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Core Quick Play & Sidebar sections */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
          {/* Quick Play Column */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 8' }}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md" fontFamily="heading">
                Mabilisang Laro (Quick Play)
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {priorityGames.length > 0 ? (
                  priorityGames.map((game) => (
                    <Card key={game._id} variant="outline" _hover={{ shadow: 'md', borderColor: 'brand.gold' }} transition="all 0.2s">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Heading size="xs" textTransform="uppercase" color="brand.gold">
                              {game.category}
                            </Heading>
                            <Badge colorScheme="blue">{game.type.toUpperCase()}</Badge>
                          </HStack>
                          <Heading size="sm" fontFamily="heading">
                            {game.name} ({game.filipinoName})
                          </Heading>
                          <Text fontSize="sm" color="gray.500" noOfLines={2}>
                            {game.description}
                          </Text>
                          <HStack spacing={2} pt={2}>
                            <Button
                              flex={1}
                              size="sm"
                              variant="solid"
                              onClick={() => navigate(`/games/${game.slug}?mode=pvp`)}
                            >
                              PVP (Online)
                            </Button>
                            <Button
                              flex={1}
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/games/${game.slug}?mode=pvc`)}
                            >
                              PVC (vs Bot)
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Center h="100px">
                    <Text color="gray.500">Niloload ang mga laro...</Text>
                  </Center>
                )}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Social/Community Panel */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
            <VStack align="stretch" spacing={6}>
              {/* Challenges */}
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="sm" fontFamily="heading">
                      Bayanihan Challenges
                    </Heading>
                    {challenges.length > 0 ? (
                      challenges.map((ch) => (
                        <VStack key={ch._id} align="stretch" spacing={1}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="bold">{ch.title}</Text>
                            <Badge colorScheme="purple">+{ch.reward?.value} XP</Badge>
                          </HStack>
                          <Progress
                            value={(ch.currentCount / ch.targetCount) * 100}
                            size="sm"
                            colorScheme="purple"
                            borderRadius="full"
                          />
                          <Text fontSize="xs" color="gray.500" textAlign="right">
                            {ch.currentCount}/{ch.targetCount}
                          </Text>
                        </VStack>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        Walang aktibong hamon sa ngayon.
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Memory wall snippet */}
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="sm" fontFamily="heading">
                      Childhood Memory Wall
                    </Heading>
                    {recentMemories.length > 0 ? (
                      <Stack spacing={3}>
                        {recentMemories.map((mem) => (
                          <VStack key={mem._id} align="stretch" spacing={1} p={2} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="lg">
                            <HStack>
                              <Icon as={LucideQuote} size={14} color="brand.gold" />
                              <Text fontSize="xs" fontWeight="bold">@{mem.userId?.username || 'anonymous'}</Text>
                            </HStack>
                            <Text fontSize="xs" noOfLines={2} fontStyle="italic">
                              "{mem.content}"
                            </Text>
                          </VStack>
                        ))}
                        <Button size="xs" variant="link" color="brand.blue" onClick={() => navigate('/collection-book')}>
                          Tumingin sa Memory Wall
                        </Button>
                      </Stack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        Ipahayag ang iyong alaala!
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </MainLayout>
  );
};

export default Dashboard;
