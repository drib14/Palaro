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
  Badge,
  Center,
  Spinner,
  Stack,
  VStack,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const ProvinceRankings = () => {
  const { user } = useAuth();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/provinces?limit=82');
        if (res.data.success) {
          setProvinces(res.data.data.provinces);
        }
      } catch (err) {
        console.warn('Failed to load province rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <MainLayout>
      <Box maxW="4xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Palaro Probinsya Rankings
          </Heading>
          <Text color="gray.500">
            Ang bawat panalo mo sa laro ay nagbibigay ng puntos sa iyong sariling probinsya! Alamin kung aling probinsya ang pinaka-aktibo.
          </Text>
        </Stack>

        <Card>
          <CardBody p={0}>
            {loading ? (
              <Center p={10}>
                <Spinner size="lg" color="brand.gold" />
              </Center>
            ) : provinces.length > 0 ? (
              <Table variant="simple">
                <Thead bg="brand.nightMarket">
                  <Tr>
                    <Th color="gray.400">Rank</Th>
                    <Th color="gray.400">Probinsya (Province)</Th>
                    <Th color="gray.400">Rehiyon (Region)</Th>
                    <Th color="gray.400" isNumeric>Mga Manlalaro (Players)</Th>
                    <Th color="gray.400" isNumeric>Kabuuan ng Puntos (Total Points)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {provinces.map((prov, index) => {
                    const isMyProvince = user?.province === prov.name;
                    return (
                      <Tr
                        key={prov._id}
                        bg={isMyProvince ? 'rgba(247, 183, 49, 0.08)' : 'transparent'}
                        _hover={{ bg: isMyProvince ? 'rgba(247, 183, 49, 0.12)' : 'rgba(255,255,255,0.02)' }}
                      >
                        <Td fontWeight="bold">
                          {index + 1}
                        </Td>
                        <Td fontWeight="bold">
                          {prov.name} {isMyProvince && <Badge colorScheme="yellow" ml={2}>Iyo</Badge>}
                        </Td>
                        <Td>{prov.region}</Td>
                        <Td isNumeric>{prov.playerCount || 0}</Td>
                        <Td isNumeric fontWeight="bold" color="brand.red">
                          {prov.totalPoints || 0} pts
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <Center p={10}>
                <Text color="gray.500">Walang nakalistang probinsya.</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default ProvinceRankings;
