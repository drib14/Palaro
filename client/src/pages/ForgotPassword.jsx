import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  Alert,
  AlertIcon,
  Center,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage('Ang password reset link ay matagumpay na naipadala sa iyong email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgGradient = useColorModeValue(
    'linear(to-br, #FAFAF5, #fffbeb, #e8f0fe)',
    'linear(to-br, #0d1117, #161b22, #10151B)'
  );

  return (
    <Center minH="100vh" bgGradient={bgGradient} px={4}>
      <Box
        maxW="md"
        w="full"
        bg={useColorModeValue('white', 'brand.bahayKubo')}
        boxShadow="2xl"
        borderRadius="2xl"
        p={8}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.800')}
        className="anim-slide-up"
      >
        <Stack spacing={6}>
          <Stack align="center" textAlign="center">
            <Heading fontSize="3xl" fontFamily="heading" fontWeight="extrabold">
              Nakalimot sa Password?
            </Heading>
            <Text fontSize="md" color="gray.500">
              Ilagay ang iyong email at padadalhan ka namin ng recovery link.
            </Text>
          </Stack>

          {error && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          {message && (
            <Alert status="success" borderRadius="xl">
              <AlertIcon />
              <Text fontSize="sm">{message}</Text>
            </Alert>
          )}

          {!message && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="email" isRequired>
                  <FormLabel fontWeight="semibold">Email Address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ilagay ang iyong email address"
                    focusBorderColor="brand.gold"
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>

                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Ipinapadala..."
                  borderRadius="xl"
                  mt={2}
                >
                  Ipadala ang Link
                </Button>
              </Stack>
            </form>
          )}

          <Center fontSize="sm" color="gray.500">
            <Link as={RouterLink} to="/login" color="brand.blue" fontWeight="bold">
              Bumalik sa Login
            </Link>
          </Center>
        </Stack>
      </Box>
    </Center>
  );
};

export default ForgotPassword;
