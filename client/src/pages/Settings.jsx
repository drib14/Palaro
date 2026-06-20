import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [province, setProvince] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setProvince(user.province || '');
    }
  }, [user]);

  const handleLocationChange = async (e) => {
    const val = e.target.value;
    setProvince(val);

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
    setProvince(displayName);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const res = await updateProfile({ province });
    
    if (res.success) {
      toast({
        title: 'Settings na-update!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error sa Pag-save',
        description: res.error,
        status: 'error',
      });
    }
    setIsSaving(false);
  };

  return (
    <MainLayout>
      <Box maxW="2xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Mga Setting (Account Settings)
          </Heading>
          <Text color="gray.500">
            I-manage ang iyong personal na details at game options.
          </Text>
        </Stack>

        <Card>
          <CardBody>
            <form onSubmit={handleSave}>
              <VStack spacing={4} align="stretch">
                <FormControl id="province" position="relative">
                  <FormLabel fontWeight="semibold">Kakatawining Lugar (Location)</FormLabel>
                  <Input
                    type="text"
                    value={province}
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

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  isLoading={isSaving}
                  loadingText="Inililigtas..."
                  borderRadius="xl"
                  mt={4}
                >
                  I-save ang Pagbabago
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default Settings;
