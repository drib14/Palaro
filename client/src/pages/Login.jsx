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
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Center,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { login, isAuthenticated, error, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  // If already logged in, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const res = await login(identifier, password);
    if (res?.success) {
      navigate('/dashboard');
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
              Maligayang Pagbabalik!
            </Heading>
            <Text fontSize="md" color="gray.500">
              Mag-login para maglaro ng mga Larong Pinoy
            </Text>
          </Stack>

          {(localError || error) && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              <Text fontSize="sm">{localError || error}</Text>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="identifier">
                <FormLabel fontWeight="semibold">Email o Username</FormLabel>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ilagay ang iyong email o username"
                  focusBorderColor="brand.gold"
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl id="password">
                <FormLabel fontWeight="semibold">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ilagay ang iyong password"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Stack spacing={3} pt={2}>
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Sumasali..."
                  borderRadius="xl"
                >
                  Mag-login
                </Button>
              </Stack>
            </Stack>
          </form>

          <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
            <Text>
              Walang account?{' '}
              <Link as={RouterLink} to="/register" color="brand.blue" fontWeight="bold">
                Mag-register
              </Link>
            </Text>
            <Link as={RouterLink} to="/forgot-password" color="brand.blue">
              Nakalimutan ang Password?
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Center>
  );
};

export default Login;
