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
  useToast,
  Center,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const BarangayClubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubType, setNewClubType] = useState('barangay');
  
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const toast = useToast();

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clubs');
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.warn('Failed to load Barangay Clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    try {
      const res = await api.post('/clubs', {
        name: newClubName.trim(),
        description: newClubDesc.trim(),
        type: newClubType,
        province: user?.province,
      });

      if (res.data.success) {
        setClubs([res.data.club, ...clubs]);
        setNewClubName('');
        setNewClubDesc('');
        setShowCreate(false);
        toast({
          title: 'Barangay Club Nalikha!',
          description: `Welcome sa ${res.data.club.name}!`,
          status: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to create club',
        description: err.response?.data?.message || 'Try again',
        status: 'error',
      });
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/join`);
      if (res.data.success) {
        toast({
          title: 'Successfully joined club!',
          status: 'success',
        });
        fetchClubs(); // reload list
      }
    } catch (err) {
      toast({
        title: 'Error joining club',
        description: err.response?.data?.message || 'Failed',
        status: 'error',
      });
    }
  };

  const handleLeaveClub = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/leave`);
      if (res.data.success) {
        toast({
          title: 'Successfully left the club.',
          status: 'info',
        });
        fetchClubs();
      }
    } catch (err) {
      toast({
        title: 'Error leaving club',
        description: err.response?.data?.message || 'Failed',
        status: 'error',
      });
    }
  };

  const cardBg = useColorModeValue('white', 'brand.bahayKubo');

  return (
    <MainLayout>
      <Box maxW="5xl" mx="auto" px={4} py={4}>
        <Stack spacing={4} mb={8} direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
              Mga Barangay Club
            </Heading>
            <Text color="gray.500">
              Sali sa iyong barangay o school club para makilahok sa exclusive tournaments at palakasin ang inyong total score points!
            </Text>
          </VStack>

          <Button colorScheme="primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'I-cancel' : 'Gumawa ng Club'}
          </Button>
        </Stack>

        {/* Create Club Form */}
        {showCreate && (
          <Card bg={cardBg} mb={8} className="anim-slide-up">
            <CardBody>
              <Heading size="sm" mb={4} fontFamily="heading">Bagong Club Form</Heading>
              <form onSubmit={handleCreateClub}>
                <VStack align="stretch" spacing={3}>
                  <Input
                    placeholder="Pangalan ng Club (e.g. Brgy. Commonwealth Sipa Club)"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                    isRequired
                  />
                  <Input
                    placeholder="Deskripsyon ng inyong mga aktibidad"
                    value={newClubDesc}
                    onChange={(e) => setNewClubDesc(e.target.value)}
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                  <Button type="submit" colorScheme="primary">
                    I-save at Likhain
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Clubs Grid List */}
        {loading ? (
          <Center h="30vh">
            <Spinner size="lg" color="brand.gold" />
          </Center>
        ) : clubs.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {clubs.map((club) => {
              const isMember = club.members.some(m => m.userId === user?._id);
              const isLeader = club.leader?._id === user?._id;
              
              return (
                <Card key={club._id} bg={cardBg} border="1px solid" borderColor="gray.800">
                  <CardBody>
                    <Stack spacing={3}>
                      <HStack justify="space-between">
                        <Badge colorScheme="purple">{club.type.toUpperCase()}</Badge>
                        <Text fontSize="xs" color="gray.500">{club.members.length}/{club.maxMembers} Members</Text>
                      </HStack>

                      <Heading size="md" fontFamily="heading">
                        {club.name}
                      </Heading>
                      <Text fontSize="sm" color="gray.400" noOfLines={2}>
                        {club.description || 'No description provided.'}
                      </Text>

                      <Divider />

                      <HStack justify="space-between" pt={2}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="2xs" color="gray.500">KABUUANG PUNTOS</Text>
                          <Text fontWeight="bold" color="brand.gold">{club.totalPoints} pts</Text>
                        </VStack>

                        {isLeader ? (
                          <Badge colorScheme="yellow">Leader</Badge>
                        ) : isMember ? (
                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleLeaveClub(club._id)}>
                            Leave Club
                          </Button>
                        ) : (
                          <Button size="sm" colorScheme="primary" onClick={() => handleJoinClub(club._id)}>
                            Sumali sa Club
                          </Button>
                        )}
                      </HStack>
                    </Stack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Center h="20vh">
            <Text color="gray.500">Walang barangay club na nakita. Maging una sa paglikha!</Text>
          </Center>
        )}
      </Box>
    </MainLayout>
  );
};

export default BarangayClubs;
