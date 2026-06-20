import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Button,
  Card,
  CardBody,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Badge,
  useColorModeValue,
  Center,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import useGameStore from '../store/gameStore';

const GameSelect = () => {
  const { games, fetchGames, isLoading } = useGameStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Filters logic
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.filipinoName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || game.type === typeFilter;
    const matchesCat = catFilter === 'all' || game.category === catFilter;

    return matchesSearch && matchesType && matchesCat;
  });

  const borderHoverColor = useColorModeValue('brand.blue', 'brand.gold');

  return (
    <MainLayout>
      <Box maxW="6xl" mx="auto" px={4} py={4}>
        <Stack spacing={4} mb={8}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Mga Larong Pinoy Collection
          </Heading>
          <Text color="gray.500">
            Pumili ng nais laruin! Maaari kang makipagkompetensya online (PVP) o maglaro nang mag-isa (PVC) kasama ang computer.
          </Text>

          {/* Filtering bar */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} pt={2}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Maghanap ng laro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                focusBorderColor="brand.gold"
                borderRadius="xl"
              />
            </InputGroup>

            <Select
              placeholder="Salain ayon sa Uri (2D/3D)"
              size="lg"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value || 'all')}
              focusBorderColor="brand.gold"
              borderRadius="xl"
            >
              <option value="2d">Mga Larong 2D</option>
              <option value="3d">Mga Larong 3D</option>
            </Select>

            <Select
              placeholder="Salain ayon sa Category"
              size="lg"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value || 'all')}
              focusBorderColor="brand.gold"
              borderRadius="xl"
            >
              <option value="outdoor">Panlabas (Outdoor)</option>
              <option value="physical">Pisikal (Physical)</option>
              <option value="strategy">Estratehiya (Strategy)</option>
              <option value="dexterity">Liksi (Dexterity)</option>
            </Select>
          </SimpleGrid>
        </Stack>

        {isLoading ? (
          <Center h="30vh">
            <Text>Niloload ang koleksyon ng mga laro...</Text>
          </Center>
        ) : filteredGames.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {filteredGames.map((game) => (
              <Card
                key={game._id}
                variant="outline"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'lg',
                  borderColor: borderHoverColor,
                }}
                borderRadius="2xl"
              >
                <CardBody>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Badge colorScheme="yellow" px={2} borderRadius="md">
                        {game.category.toUpperCase()}
                      </Badge>
                      <Badge colorScheme={game.type === '3d' ? 'purple' : 'teal'}>
                        {game.type.toUpperCase()}
                      </Badge>
                    </HStack>

                    <Heading size="md" fontFamily="heading">
                      {game.name}
                    </Heading>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mt={-1}>
                      Filipino: {game.filipinoName}
                    </Text>

                    <Text fontSize="sm" color="gray.500" noOfLines={3}>
                      {game.description}
                    </Text>

                    <HStack spacing={2} pt={4}>
                      <Button
                        flex={1}
                        size="md"
                        variant="solid"
                        onClick={() => navigate(`/games/${game.slug}?mode=pvp`)}
                      >
                        PVP (Online)
                      </Button>
                      <Button
                        flex={1}
                        size="md"
                        variant="secondary"
                        onClick={() => navigate(`/games/${game.slug}?mode=pvc`)}
                      >
                        PVC (Bot)
                      </Button>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Center h="20vh">
            <Text color="gray.500">Walang nahanap na laro sa kasalukuyang filter.</Text>
          </Center>
        )}
      </Box>
    </MainLayout>
  );
};

export default GameSelect;
