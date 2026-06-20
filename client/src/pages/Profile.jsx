import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Center,
  Progress,
  Badge,
  HStack,
  VStack,
  Avatar,
  Divider,
  Icon,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import CharacterRenderer from '../components/Character/CharacterRenderer';
import useAuth from '../hooks/useAuth';
import useCharacter from '../hooks/useCharacter';
import api from '../services/api';
import { LucideAward, LucideTrophy, LucideCalendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { character } = useCharacter();
  const [achievements, setAchievements] = useState([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements/me');
        if (res.data.success) {
          setAchievements(res.data.achievements);
          setUnlockedCount(res.data.summary?.unlockedCount || 0);
        }
      } catch (err) {
        console.warn('Failed to load user achievements');
      }
    };
    fetchAchievements();
  }, []);

  const cardBg = useColorModeValue('white', 'brand.bahayKubo');

  return (
    <MainLayout>
      <Box maxW="5xl" mx="auto" px={4} py={4}>
        <SimpleGrid columns={{ base: 1, md: 12 }} gap={8}>
          
          {/* Visual Avatar Summary Card (Left) */}
          <Box gridColumn={{ base: 'span 1', md: 'span 4' }}>
            <Card bg={cardBg}>
              <CardBody textAlign="center">
                {/* Character preview */}
                <Box p={4} borderRadius="xl" bg={useColorModeValue('gray.50', 'brand.nightMarket')} mb={4}>
                  <CharacterRenderer config={character} size="180px" />
                </Box>

                <Heading size="md" mb={1} fontFamily="heading">
                  {user?.username}
                </Heading>
                <Badge colorScheme="yellow" mb={4}>
                  Level {user?.level || 1} Player
                </Badge>

                <Divider my={4} />

                {/* Private metadata details (visible only to the user themselves) */}
                <Stack spacing={2} align="start" fontSize="sm" textAlign="left">
                  <HStack justify="space-between" w="full">
                    <Text color="gray.500" fontWeight="bold">Tunay na Pangalan:</Text>
                    <Text fontWeight="medium">{user?.firstName} {user?.lastName}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.500" fontWeight="bold">Email:</Text>
                    <Text fontWeight="medium" isTruncated maxW="160px">{user?.email}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.500" fontWeight="bold">Kasarian:</Text>
                    <Text fontWeight="medium" textTransform="capitalize">{user?.gender}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text color="gray.500" fontWeight="bold">Probinsya:</Text>
                    <Text fontWeight="medium">{user?.province || 'Hindi Nakatakda'}</Text>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          </Box>

          {/* Achievements progress & cards (Right) */}
          <Box gridColumn={{ base: 'span 1', md: 'span 8' }}>
            <VStack spacing={6} align="stretch">
              
              {/* Achievement Summary Progress Card */}
              <Card bg={cardBg}>
                <CardBody>
                  <Stack spacing={4}>
                    <Heading size="md" fontFamily="heading">
                      Mga Gantimpala (Achievements)
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                      Mayroon kang {unlockedCount} unlocked achievements sa {achievements.length} kabuuan.
                    </Text>
                    <Progress
                      value={(unlockedCount / (achievements.length || 1)) * 100}
                      size="md"
                      colorScheme="yellow"
                      borderRadius="full"
                    />
                  </Stack>
                </CardBody>
              </Card>

              {/* Achievements list cards */}
              <Heading size="md" fontFamily="heading">
                Listahan ng mga Achievement
              </Heading>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {achievements.map((ach) => (
                  <Card key={ach._id} opacity={ach.unlocked ? 1 : 0.6} variant="outline" borderColor={ach.unlocked ? 'brand.gold' : 'gray.800'}>
                    <CardBody>
                      <HStack spacing={4} align="start">
                        <Center w="50px" h="50px" bg={ach.unlocked ? 'rgba(247, 183, 49, 0.15)' : 'gray.800'} borderRadius="xl" fontSize="2xl">
                          {ach.icon}
                        </Center>
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="sm">{ach.name}</Text>
                            {ach.unlocked && <Badge colorScheme="green">Unlocked</Badge>}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {ach.description}
                          </Text>
                          <Text fontSize="2xs" color="brand.gold" fontWeight="bold" mt={2}>
                            +{ach.xpReward} XP Reward
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>

            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    </MainLayout>
  );
};

export default Profile;
