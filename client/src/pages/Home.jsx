import React from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Image,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LucideGamepad2, LucideUsers, LucideHistory, LucideTrophy, LucideSparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const heroBg = useColorModeValue(
    'radial-gradient(circle, rgba(254,243,199,0.5) 0%, rgba(250,250,245,1) 100%)',
    'radial-gradient(circle, rgba(22,27,34,0.3) 0%, rgba(13,17,23,1) 100%)'
  );

  const features = [
    {
      title: 'Mabilisang Multiplayer & AI',
      description: 'Labanan ang mga tunay na manlalaro online (PVP) o magsanay laban sa matatalinong AI bot (PVC).',
      icon: LucideGamepad2,
      color: 'brand.gold',
    },
    {
      title: 'Bihisan ang Iyong Karakter',
      description: 'Mag-customize ng visual avatar gamit ang Barong Tagalog, Katipunan bandana, salakot at mga modernong damit.',
      icon: LucideSparkles,
      color: 'brand.red',
    },
    {
      title: 'Virtual Proximity Playground',
      description: 'Maglakad-lakad sa 2D playground, makipag-chat, at hamunin ang iba sa real-time gamit ang visual controls.',
      icon: LucideUsers,
      color: 'brand.blue',
    },
    {
      title: 'Collection Book (Museum)',
      description: 'Basahin ang pinagmulan, patakaran, at natatanging local variations ng bawat tradisyonal na larong Pinoy.',
      icon: LucideHistory,
      color: 'brand.green',
    },
  ];

  return (
    <Box minH="100vh" overflow="hidden">
      {/* Hero Section */}
      <Box bg={heroBg} py={{ base: 20, md: 36 }} position="relative">
        <Container maxW="5xl" px={6}>
          <Stack spacing={8} align="center" textAlign="center">
            <Heading
              fontSize={{ base: '4xl', md: '7xl' }}
              fontFamily="heading"
              fontWeight="black"
              lineHeight="1.1"
              bgGradient="linear(to-r, brand.gold, brand.red, brand.blue)"
              bgClip="text"
              className="anim-float"
            >
              Palaro
            </Heading>
            <Heading fontSize={{ base: '2xl', md: '3xl' }} maxW="2xl" fontWeight="semibold" color="gray.400">
              Preserving Traditional Filipino Childhood Games through Gamification & Play.
            </Heading>
            <Text fontSize="lg" maxW="3xl" color="gray.500">
              Balikan ang saya ng patintero, tumbang preso, sungka, at holen! Kumatawan sa iyong probinsya at makipaglaro sa buong pamayanan sa modernong web.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="primary"
                px={8}
                height="60px"
                borderRadius="xl"
                fontSize="md"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              >
                {isAuthenticated ? 'Pumunta sa Dashboard' : 'Magsimula nang Libre'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                px={8}
                height="60px"
                borderRadius="xl"
                fontSize="md"
                onClick={() => navigate('/games')}
              >
                Tingnan ang mga Laro
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Grid Features */}
      <Box py={20} bg={useColorModeValue('white', 'brand.bahayKubo')}>
        <Container maxW="6xl" px={6}>
          <Stack spacing={4} align="center" textAlign="center" mb={16}>
            <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
              Mga Tampok ng Palaro
            </Heading>
            <Text color="gray.500" maxW="lg">
              Pinagsama-sama namin ang saya ng lumang laro at teknolohiya ng bagong henerasyon.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feat, index) => (
              <Box
                key={index}
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.800')}
                bg={useColorModeValue('gray.50', 'brand.nightMarket')}
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-5px)', shadow: 'xl', borderColor: 'brand.gold' }}
              >
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="xl"
                  bg="brand.nightMarket"
                  color={feat.color}
                  boxShadow="md"
                  mb={4}
                >
                  <Icon as={feat.icon} size={24} color={feat.color} />
                </Flex>
                <Heading size="sm" mb={2} fontFamily="heading" fontWeight="bold">
                  {feat.title}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {feat.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
