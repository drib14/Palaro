import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
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
  Divider,
  SimpleGrid,
  Progress,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { getAvatarUrl } from '../utils/avatarHelper';

const FamilyDashboard = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchFamily = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/family');
      if (res.data.success) {
        setFamily(res.data.family);
      }
    } catch (err) {
      console.warn('Failed to load family dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    try {
      const res = await api.post('/family', { name: familyName.trim() });
      if (res.data.success) {
        setFamily(res.data.family);
        toast({
          title: 'Family Group Nalikha!',
          description: `Welcome sa ${res.data.family.name}!`,
          status: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'Error sa Paglikha',
        description: err.response?.data?.message || 'Try again',
        status: 'error',
      });
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      const res = await api.post('/family/join', { inviteCode: inviteCode.trim() });
      if (res.data.success) {
        setFamily(res.data.family);
        toast({
          title: 'Sumali sa Family!',
          status: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'Error sa Pagsali',
        description: err.response?.data?.message || 'Invalid invite code',
        status: 'error',
      });
    }
  };

  const handleLeaveFamily = async () => {
    try {
      const res = await api.post('/family/leave');
      if (res.data.success) {
        setFamily(null);
        toast({
          title: 'Umalis sa Family Group',
          status: 'info',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <Box maxW="4xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Aking Pamilya (Family Dashboard)
          </Heading>
          <Text color="gray.500">
            Ikonekta ang magulang at anak na account para sa ligtas at sabay na pagsubaybay sa mga tagumpay.
          </Text>
        </Stack>

        {isLoading ? (
          <Center h="30vh">
            <Text>Niloload ang family dashboard...</Text>
          </Center>
        ) : !family ? (
          // Create or Join options
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {/* Create Group */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" fontFamily="heading">
                    Gumawa ng Family Group
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Kung ikaw ay magulang, maaari kang gumawa ng pamilya at bigyan ng invite code ang iyong mga anak.
                  </Text>
                  <form onSubmit={handleCreateFamily}>
                    <VStack align="stretch" spacing={3}>
                      <Input
                        placeholder="Pangalan ng Pamilya (e.g. Dela Cruz Family)"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        focusBorderColor="brand.gold"
                        borderRadius="xl"
                      />
                      <Button type="submit" colorScheme="primary">
                        Gumawa ng Pamilya
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>

            {/* Join Group */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" fontFamily="heading">
                    Sumali sa Family Group
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Gamitin ang 6-character invite code na ibinahagi ng iyong magulang upang mag-link ng account.
                  </Text>
                  <form onSubmit={handleJoinFamily}>
                    <VStack align="stretch" spacing={3}>
                      <Input
                        placeholder="Ilagay ang Invite Code (e.g. A3F8ED)"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        focusBorderColor="brand.gold"
                        borderRadius="xl"
                      />
                      <Button type="submit" colorScheme="primary">
                        Sumali sa Pamilya
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        ) : (
          // Active family view
          <Stack spacing={6}>
            <Card>
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" fontFamily="heading" color="brand.gold">
                      {family.name}
                    </Heading>
                    <HStack>
                      <Text fontSize="sm" color="gray.500">Invite Code:</Text>
                      <Badge colorScheme="purple" fontSize="sm" px={2} borderRadius="md">
                        {family.inviteCode}
                      </Badge>
                    </HStack>
                  </VStack>

                  <Button colorScheme="red" variant="ghost" onClick={handleLeaveFamily} mt={{ base: 4, md: 0 }}>
                    {family.parent?._id === user?._id ? 'I-delete ang Pamilya' : 'Umalis sa Pamilya'}
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            {/* Progress & shared stats */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Card gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <CardBody>
                  <Stack spacing={3}>
                    <Text fontWeight="bold">Family XP Level (Bayanihan Level)</Text>
                    <HStack justify="space-between">
                      <Badge colorScheme="yellow">Level {family.familyLevel || 1}</Badge>
                      <Text fontSize="xs">{family.familyXP || 0} XP</Text>
                    </HStack>
                    <Progress value={(family.familyXP % 2000) / 20} colorScheme="yellow" borderRadius="full" />
                  </Stack>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">MAGKASAMANG LARO</Text>
                  <Heading size="lg" color="brand.blue" mt={2}>
                    {family.gamesPlayedTogether || 0}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>Matches played with family</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Members lists */}
            <Heading size="md" fontFamily="heading">Mga Kasapi sa Pamilya (Members)</Heading>
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* Parent creator */}
                  <HStack justify="space-between">
                    <HStack>
                      <Avatar size="sm" name={family.parent?.username} src={getAvatarUrl(family.parent)} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{family.parent?.username}</Text>
                        <Badge colorScheme="purple">Magulang (Parent)</Badge>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="yellow">Level {family.parent?.level}</Badge>
                  </HStack>

                  <Divider />

                  {/* Children list */}
                  {family.children.length > 0 ? (
                    family.children.map((child) => (
                      <HStack key={child.userId?._id} justify="space-between">
                        <HStack>
                          <Avatar size="sm" name={child.userId?.username} src={getAvatarUrl(child.userId)} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{child.userId?.username}</Text>
                            <Badge colorScheme="teal">Anak (Child)</Badge>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="yellow">Level {child.userId?.level}</Badge>
                      </HStack>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      Walang nakarehistrong anak sa kasalukuyan. Ibahagi ang code sa kanila para mag-link!
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        )}
      </Box>
    </MainLayout>
  );
};

export default FamilyDashboard;
