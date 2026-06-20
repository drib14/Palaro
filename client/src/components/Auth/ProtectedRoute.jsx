import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh" bg="brand.nightMarket">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.800"
            color="brand.gold"
            size="xl"
          />
          <Text fontSize="lg" fontWeight="semibold" color="gray.400">
            Naglo-load ng iyong Palaro profile...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
