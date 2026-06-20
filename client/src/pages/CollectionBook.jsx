import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
  Divider,
  Input,
  Textarea,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import MainLayout from '../components/Layout/MainLayout';
import useGameStore from '../store/gameStore';
import api from '../services/api';
import { LucideHeart, LucideMessageSquare, LucidePlus } from 'lucide-react';

const CollectionBook = () => {
  const { games, fetchGames } = useGameStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [progress, setProgress] = useState(null);
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Set default game selection once loaded
  useEffect(() => {
    if (games.length > 0 && !selectedGame) {
      handleSelectGame(games[0]);
    }
  }, [games, selectedGame]);

  const handleSelectGame = async (game) => {
    setSelectedGame(game);
    // Fetch user progress for this game
    try {
      const res = await api.get(`/collection/${game.slug}`);
      if (res.data.success) {
        setProgress(res.data.entry);
      }
    } catch (err) {
      console.warn('Failed to load collection entry progress');
    }

    // Fetch memory wall for this game
    try {
      const res = await api.get(`/memories?gameSlug=${game.slug}`);
      if (res.data.success) {
        setMemories(res.data.memories);
      }
    } catch (err) {
      console.warn('Failed to load memories for game');
    }
  };

  const handleMarkAsRead = async (field) => {
    if (!selectedGame) return;
    try {
      const res = await api.put(`/collection/${selectedGame.slug}`, {
        [field]: true,
      });
      if (res.data.success) {
        setProgress(res.data.entry);
        toast({
          title: 'Nabasang Kasaysayan/Tuntunin!',
          description: 'Idinagdag sa iyong Museum Completion percentage.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscoverVariation = async (variationName) => {
    try {
      const res = await api.put(`/collection/${selectedGame.slug}`, {
        variation: variationName,
      });
      if (res.data.success) {
        setProgress(res.data.entry);
        toast({
          title: 'Variation Natuklasan!',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostMemory = async (e) => {
    e.preventDefault();
    if (!newMemory.trim() || !selectedGame) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/memories', {
        gameId: selectedGame._id,
        content: newMemory.trim(),
      });
      if (res.data.success) {
        setMemories([res.data.memory, ...memories]);
        setNewMemory('');
        toast({
          title: 'Memory Wall updated!',
          description: 'Nai-post ang iyong kwentong bata.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error posting memory',
        description: err.response?.data?.message || 'Try again',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (memoryId) => {
    try {
      const res = await api.post(`/memories/${memoryId}/like`);
      if (res.data.success) {
        // Toggle in state
        setMemories(
          memories.map((m) =>
            m._id === memoryId
              ? {
                  ...m,
                  likes: res.data.liked
                    ? [...m.likes, 'userIdStub'] // Mock update count
                    : m.likes.filter((id) => id !== 'userIdStub'),
                  likeCount: res.data.likeCount,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <Box maxW="6xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Palaro Museum & Memory Wall
          </Heading>
          <Text color="gray.500">
            Dito mo matutuklasan ang kasaysayan, mga patakaran, at mga alaala ng bawat laro mula sa ating kabataan.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 12 }} gap={8}>
          {/* Games list select panel (Left) */}
          <Box gridColumn={{ base: 'span 1', md: 'span 4' }}>
            <Card maxH="80vh" overflowY="auto">
              <CardBody p={3}>
                <VStack spacing={1} align="stretch">
                  {games.map((g) => (
                    <Button
                      key={g._id}
                      onClick={() => handleSelectGame(g)}
                      justifyContent="flex-start"
                      variant={selectedGame?.slug === g.slug ? 'solid' : 'ghost'}
                      colorScheme={selectedGame?.slug === g.slug ? 'primary' : undefined}
                      bg={selectedGame?.slug === g.slug ? 'brand.gold' : 'transparent'}
                      color={selectedGame?.slug === g.slug ? 'brand.nightMarket' : undefined}
                      borderRadius="xl"
                      py={6}
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{g.name}</Text>
                        <Text fontSize="xs" opacity={0.8}>{g.filipinoName}</Text>
                      </VStack>
                    </Button>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Game Detail Information (Right) */}
          <Box gridColumn={{ base: 'span 1', md: 'span 8' }}>
            {selectedGame ? (
              <Stack spacing={6}>
                {/* Header overview */}
                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={3}>
                      <Badge colorScheme="yellow">{selectedGame.category.toUpperCase()}</Badge>
                      <Badge colorScheme="blue">{progress?.completionPercentage || 0}% Completed</Badge>
                    </HStack>
                    <Heading size="lg" fontFamily="heading" mb={2}>
                      {selectedGame.name} ({selectedGame.filipinoName})
                    </Heading>
                    <Text fontSize="md" color="gray.500">
                      {selectedGame.description}
                    </Text>
                  </CardBody>
                </Card>

                {/* Main museum details tabs */}
                <Card bg={useColorModeValue('white', 'brand.bahayKubo')}>
                  <CardBody p={4}>
                    <Tabs variant="line" colorScheme="yellow">
                      <TabList>
                        <Tab fontWeight="bold">Kasaysayan (History)</Tab>
                        <Tab fontWeight="bold">Tuntunin (Rules)</Tab>
                        <Tab fontWeight="bold">Variations</Tab>
                      </TabList>

                      <TabPanels>
                        {/* History */}
                        <TabPanel>
                          <Stack spacing={4}>
                            <Text whiteSpace="pre-line" lineHeight="tall">{selectedGame.history}</Text>
                            {!progress?.readHistory ? (
                              <Button
                                leftIcon={<CheckCircleIcon />}
                                colorScheme="primary"
                                onClick={() => handleMarkAsRead('readHistory')}
                                alignSelf="flex-start"
                                size="sm"
                              >
                                Mark History as Read (+25% Progress)
                              </Button>
                            ) : (
                              <Badge colorScheme="green" alignSelf="flex-start">Nabasa na ang Kasaysayan</Badge>
                            )}
                          </Stack>
                        </TabPanel>

                        {/* Rules */}
                        <TabPanel>
                          <Stack spacing={4}>
                            <Text whiteSpace="pre-line" lineHeight="tall">{selectedGame.rules}</Text>
                            {!progress?.readRules ? (
                              <Button
                                leftIcon={<CheckCircleIcon />}
                                colorScheme="primary"
                                onClick={() => handleMarkAsRead('readRules')}
                                alignSelf="flex-start"
                                size="sm"
                              >
                                Mark Rules as Read (+25% Progress)
                              </Button>
                            ) : (
                              <Badge colorScheme="green" alignSelf="flex-start">Nabasa na ang mga Tuntunin</Badge>
                            )}
                          </Stack>
                        </TabPanel>

                        {/* Variations */}
                        <TabPanel>
                          <Stack spacing={4}>
                            <Text color="gray.500" fontSize="sm">
                              Tuklasin ang iba't ibang bersyon ng larong ito sa bawat probinsya sa bansa!
                            </Text>
                            {selectedGame.variations && selectedGame.variations.length > 0 ? (
                              selectedGame.variations.map((v) => {
                                const discovered = progress?.discoveredVariations?.includes(v.name);
                                return (
                                  <Card key={v.name} variant="outline" p={3} borderColor={discovered ? 'brand.gold' : 'gray.700'}>
                                    <HStack justify="space-between">
                                      <VStack align="start" spacing={0}>
                                        <HStack>
                                          <Text fontWeight="bold">{v.name}</Text>
                                          <Badge colorScheme="blue">{v.region}</Badge>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">{v.description}</Text>
                                      </VStack>
                                      {!discovered ? (
                                        <Button
                                          size="xs"
                                          leftIcon={<LucidePlus size={12} />}
                                          onClick={() => handleDiscoverVariation(v.name)}
                                        >
                                          Discover
                                        </Button>
                                      ) : (
                                        <Badge colorScheme="green">Discovered</Badge>
                                      )}
                                    </HStack>
                                  </Card>
                                );
                              })
                            ) : (
                              <Text>Walang nakarehistrong unique variations.</Text>
                            )}
                          </Stack>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </CardBody>
                </Card>

                {/* Memory Wall section */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4} fontFamily="heading">
                      Memory Wall: Mga Kwentong Bata
                    </Heading>

                    {/* Submit story */}
                    <form onSubmit={handlePostMemory}>
                      <VStack align="stretch" spacing={3} mb={6}>
                        <Textarea
                          placeholder="Dito mo i-share ang iyong mga nakakatuwang kwento at alaala noong nilalaro mo ito noong bata..."
                          value={newMemory}
                          onChange={(e) => setNewMemory(e.target.value)}
                          focusBorderColor="brand.gold"
                          borderRadius="xl"
                        />
                        <Button
                          type="submit"
                          colorScheme="primary"
                          isLoading={isSubmitting}
                          loadingText="Ipinapadala..."
                          alignSelf="flex-end"
                          px={6}
                        >
                          I-post ang Alaala
                        </Button>
                      </VStack>
                    </form>

                    <Divider mb={6} />

                    {/* Memories list */}
                    <VStack align="stretch" spacing={4}>
                      {memories.length > 0 ? (
                        memories.map((m) => (
                          <Box key={m._id} p={4} bg={useColorModeValue('gray.50', 'brand.nightMarket')} borderRadius="xl" border="1px solid" borderColor="gray.800">
                            <Stack spacing={2}>
                              <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize="sm">
                                  @{m.userId?.username || 'anonymous'}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(m.createdAt).toLocaleDateString()}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" fontStyle="italic" pl={2} borderLeft="3px solid" borderLeftColor="brand.gold">
                                "{m.content}"
                              </Text>
                              <HStack spacing={4} pt={2}>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  leftIcon={<LucideHeart size={14} fill={m.likes?.includes('userIdStub') ? '#E74C3C' : 'none'} color="#E74C3C" />}
                                  onClick={() => handleToggleLike(m._id)}
                                >
                                  {m.likeCount || 0} Likes
                                </Button>
                              </HStack>
                            </Stack>
                          </Box>
                        ))
                      ) : (
                        <Center h="100px">
                          <Text color="gray.500">Maging una sa pagbahagi ng iyong kwento!</Text>
                        </Center>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Stack>
            ) : (
              <Center h="30vh">
                <Text>Pumili ng laro upang makita ang detalye.</Text>
              </Center>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </MainLayout>
  );
};

export default CollectionBook;
