import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Avatar,
  Badge,
  Center,
  Spinner,
  Select,
  HStack,
  VStack,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('xp');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/leaderboard?sortBy=${sortBy}&limit=20`);
        if (res.data.success) {
          setUsers(res.data.data.users);
        }
      } catch (err) {
        console.warn('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  return (
    <MainLayout>
      <Box maxW="4xl" mx="auto" px={4} py={4}>
        <Stack spacing={4} mb={6} direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'start', sm: 'center' }}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
              Global Leaderboard
            </Heading>
            <Text color="gray.500">
              Tingnan ang pinakamagagaling na manlalaro sa buong bansa!
            </Text>
          </VStack>

          <Select
            w={{ base: 'full', sm: '200px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            focusBorderColor="brand.gold"
            borderRadius="xl"
          >
            <option value="xp">Sort by Total XP</option>
            <option value="wins">Sort by Wins</option>
          </Select>
        </Stack>

        <Card>
          <CardBody p={0}>
            {loading ? (
              <Center p={10}>
                <Spinner size="lg" color="brand.gold" />
              </Center>
            ) : users.length > 0 ? (
              <Table variant="simple">
                <Thead bg="brand.nightMarket">
                  <Tr>
                    <Th color="gray.400">Rank</Th>
                    <Th color="gray.400">Manlalaro (Player)</Th>
                    <Th color="gray.400">Probinsya (Province)</Th>
                    <Th color="gray.400">Level</Th>
                    <Th color="gray.400" isNumeric>Karanasan (XP)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((userRecord, index) => (
                    <Tr key={userRecord._id} _hover={{ bg: 'rgba(255,255,255,0.02)' }}>
                      <Td fontWeight="bold">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </Td>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={userRecord.username} src={userRecord.avatar} />
                          <Text fontWeight="bold">{userRecord.username}</Text>
                        </HStack>
                      </Td>
                      <Td>{userRecord.province || 'No Province Set'}</Td>
                      <Td>
                        <Badge colorScheme="yellow">Level {userRecord.level}</Badge>
                      </Td>
                      <Td isNumeric fontWeight="bold" color="brand.gold">
                        {userRecord.xp} XP
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Center p={10}>
                <Text color="gray.500">Walang nakalistang manlalaro.</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default Leaderboard;
