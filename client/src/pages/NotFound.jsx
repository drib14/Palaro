import React from 'react';
import { Box, Heading, Text, Button, Center, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Center h="100vh" bg="brand.nightMarket" color="white" px={4}>
      <VStack spacing={6} textAlign="center">
        <Heading size="3xl" bgGradient="linear(to-r, brand.gold, brand.red)" bgClip="text" fontWeight="black">
          404
        </Heading>
        <VStack spacing={2}>
          <Heading size="md" fontFamily="heading">Naliligaw ka yata sa Kalsada?</Heading>
          <Text color="gray.500" maxW="md">
            Ang page na iyong hinahanap ay hindi nakita. Maaaring binago ang address o nataya ka na ng mga bantay!
          </Text>
        </VStack>
        <Button colorScheme="primary" size="lg" onClick={() => navigate('/')}>
          Umuwi sa Home
        </Button>
      </VStack>
    </Center>
  );
};

export default NotFound;
