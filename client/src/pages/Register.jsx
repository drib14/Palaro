import React, { useState, useEffect } from 'react';
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
  Select,
  Grid,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Register = () => {
  const { register, isAuthenticated, error, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    gender: 'prefer-not-to-say',
    province: '',
    password: '',
    confirmPassword: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleLocationChange = async (e) => {
    const val = e.target.value;
    setFormData({
      ...formData,
      province: val,
    });

    if (val.length >= 3) {
      try {
        const res = await api.get(`/location/search?q=${encodeURIComponent(val)}`);
        if (res.data.success) {
          setLocationSuggestions(res.data.locations);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Failed to load suggestions');
      }
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (displayName) => {
    setFormData({
      ...formData,
      province: displayName,
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const { email, username, firstName, lastName, gender, province, password, confirmPassword } = formData;

    if (!email || !username || !firstName || !lastName || !gender || !password) {
      setLocalError('Pakisagutan ang lahat ng mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Hindi tugma ang iyong password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Ang password ay dapat hindi bababa sa 6 na karakter.');
      return;
    }

    const res = await register({
      email,
      username,
      firstName,
      lastName,
      gender,
      province,
      password,
    });

    if (res?.success) {
      navigate('/character-editor'); // Guide to customize character right after register
    }
  };

  const bgGradient = useColorModeValue(
    'linear(to-br, #FAFAF5, #fffbeb, #e8f0fe)',
    'linear(to-br, #0d1117, #161b22, #10151B)'
  );

  return (
    <Center minH="100vh" bgGradient={bgGradient} py={10} px={4}>
      <Box
        maxW="2xl"
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
              Gumawa ng Palaro Account
            </Heading>
            <Text fontSize="md" color="gray.500">
              Sali na at makipaglaro sa buong probinsya!
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
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl id="firstName" isRequired>
                  <FormLabel fontWeight="semibold">Pangalan (First Name)</FormLabel>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ilagay ang iyong pangalan"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl id="lastName" isRequired>
                  <FormLabel fontWeight="semibold">Apelyido (Last Name)</FormLabel>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ilagay ang iyong apelyido"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl id="email" isRequired>
                  <FormLabel fontWeight="semibold">Email Address</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ilagay ang email"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl id="username" isRequired>
                  <FormLabel fontWeight="semibold">Gamename / Username</FormLabel>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Gusto mong alyas sa laro"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl id="gender" isRequired>
                  <FormLabel fontWeight="semibold">Kasarian (Gender)</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={handleChange}
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  >
                    <option value="male">Lalaki (Male)</option>
                    <option value="female">Babae (Female)</option>
                    <option value="other">Iba pa (Other)</option>
                    <option value="prefer-not-to-say">Ayaw sabihin (Prefer not to say)</option>
                  </Select>
                </FormControl>

                <FormControl id="province" position="relative">
                  <FormLabel fontWeight="semibold">Kakakatawining Lugar (Location)</FormLabel>
                  <Input
                    type="text"
                    value={formData.province}
                    onChange={handleLocationChange}
                    placeholder="Mag-type para maghanap ng lugar..."
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                    autoComplete="off"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      bg={useColorModeValue('white', 'brand.bahayKubo')}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.800')}
                      borderRadius="xl"
                      shadow="2xl"
                      zIndex={10}
                      maxH="200px"
                      overflowY="auto"
                      mt={1}
                    >
                      {locationSuggestions.map((loc) => (
                        <Box
                          key={loc.displayName}
                          px={4}
                          py={2}
                          cursor="pointer"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.800'), color: 'brand.gold' }}
                          onClick={() => selectSuggestion(loc.displayName)}
                          fontSize="sm"
                          borderBottom="1px solid"
                          borderBottomColor={useColorModeValue('gray.100', 'gray.800')}
                        >
                          {loc.displayName}
                        </Box>
                      ))}
                    </Box>
                  )}
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl id="password" isRequired>
                  <FormLabel fontWeight="semibold">Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kailangan may numero"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel fontWeight="semibold">Kumpirmahin ang Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulitin ang password"
                    focusBorderColor="brand.gold"
                    borderRadius="xl"
                  />
                </FormControl>
              </Grid>

              <Button
                type="submit"
                variant="solid"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Gumagawa ng Account..."
                borderRadius="xl"
                mt={2}
              >
                Mag-register
              </Button>
            </Stack>
          </form>

          <Center fontSize="sm" color="gray.500">
            Mayroon nang account?{' '}
            <Link as={RouterLink} to="/login" color="brand.blue" fontWeight="bold" ml={1}>
              Mag-login dito
            </Link>
          </Center>
        </Stack>
      </Box>
    </Center>
  );
};

export default Register;
