import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Radio,
  RadioGroup,
  useToast,
  Flex,
  useColorModeValue,
  Card,
  CardBody,
  Circle,
  HStack,
  Center,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import MainLayout from '../components/Layout/MainLayout';
import CharacterRenderer from '../components/Character/CharacterRenderer';
import useCharacter from '../hooks/useCharacter';
import { useNavigate } from 'react-router-dom';

const CharacterEditor = () => {
  const { character, saveCharacter, isLoading, setLocalCustomization } = useCharacter();
  const [localConfig, setLocalConfig] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Load backend configuration into local edit state
  useEffect(() => {
    if (character) {
      setLocalConfig({ ...character });
    }
  }, [character]);

  if (!localConfig) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Text>Inihahanda ang Wardrobe...</Text>
        </Center>
      </MainLayout>
    );
  }

  // Pinoy Skin Tone Presets
  const skinTones = [
    { name: 'Brown Kayumanggi', value: '#E0A96D' },
    { name: 'Light Kayumanggi', value: '#F5C7A9' },
    { name: 'Dark Kayumanggi', value: '#C68B59' },
    { name: 'Fair Skin', value: '#E8C39E' },
  ];

  // Colors for shirts/pants/shoes/hair
  const colors = {
    hair: ['#000000', '#2E1A05', '#5C3818', '#A0522D'],
    shirt: ['#1A73E8', '#E74C3C', '#F7B731', '#27AE60', '#161B22', '#FFFFFF'],
    pants: ['#161B22', '#1A73E8', '#2D3748', '#E74C3C', '#27AE60'],
  };

  const handleFieldChange = (field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const res = await saveCharacter(localConfig);
    if (res.success) {
      toast({
        title: 'Kasuotan ay Nai-save!',
        description: 'Matagumpay na nabago ang anyo ng iyong avatar.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Error sa Pag-save',
        description: res.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <MainLayout>
      <Box maxW="5xl" mx="auto" px={4} py={4}>
        <Stack spacing={2} mb={6}>
          <Heading size="lg" fontFamily="heading" fontWeight="extrabold">
            Palaro Avatar Customizer
          </Heading>
          <Text color="gray.500">
            Bihisan ang iyong karakter at i-customize ang kulay ng buhok, damit, at mga traditional na accessory!
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
          {/* Avatar live preview (Left Side) */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
            <Card position="sticky" top="100px">
              <CardBody textAlign="center">
                <Text fontWeight="bold" mb={4} textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="gray.500">
                  Live Preview
                </Text>
                
                {/* Visual rendering */}
                <Box p={6} borderRadius="xl" bg={useColorModeValue('gray.50', 'brand.nightMarket')} mb={6}>
                  <CharacterRenderer config={localConfig} size="220px" />
                </Box>

                <Stack spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold">Kasarian (Gender Model)</FormLabel>
                    <RadioGroup
                      value={localConfig.gender}
                      onChange={(val) => handleFieldChange('gender', val)}
                    >
                      <HStack spacing={4} justify="center">
                        <Radio value="male" colorScheme="yellow">Lalaki (Male)</Radio>
                        <Radio value="female" colorScheme="yellow">Babae (Female)</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>

                  <Button
                    onClick={handleSave}
                    colorScheme="primary"
                    size="lg"
                    w="full"
                    mt={4}
                  >
                    I-save ang Anyo
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </Box>

          {/* Customization options tabs (Right Side) */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 8' }}>
            <Card>
              <CardBody>
                <Tabs variant="enclosed" colorScheme="yellow">
                  <TabList overflowX="auto" whiteSpace="nowrap">
                    <Tab fontWeight="semibold">Mukha at Kulay</Tab>
                    <Tab fontWeight="semibold">Buhok</Tab>
                    <Tab fontWeight="semibold">Damit</Tab>
                    <Tab fontWeight="semibold">Accessory</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Skin Tone Panel */}
                    <TabPanel>
                      <Stack spacing={6} py={4}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Kulay ng Balat (Pinoy Skin Tone)</Text>
                          <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4}>
                            {skinTones.map((tone) => (
                              <Button
                                key={tone.value}
                                onClick={() => handleFieldChange('skinTone', tone.value)}
                                h="60px"
                                variant={localConfig.skinTone === tone.value ? 'solid' : 'secondary'}
                                borderColor={localConfig.skinTone === tone.value ? 'brand.gold' : 'gray.700'}
                                borderWidth={localConfig.skinTone === tone.value ? '2px' : '1px'}
                                flexDir="column"
                                p={2}
                              >
                                <Circle size="24px" bg={tone.value} mb={1} border="1px solid rgba(0,0,0,0.2)" />
                                <Text fontSize="xs">{tone.name}</Text>
                              </Button>
                            ))}
                          </SimpleGrid>
                        </Box>
                      </Stack>
                    </TabPanel>

                    {/* Hairstyle Panel */}
                    <TabPanel>
                      <Stack spacing={6} py={4}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Istilo ng Buhok</Text>
                          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                            <Button
                              onClick={() => handleFieldChange('hairstyle', 'hair-default')}
                              h="50px"
                              variant={localConfig.hairstyle === 'hair-default' ? 'solid' : 'secondary'}
                            >
                              Classic Crop (Maikli)
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('hairstyle', 'hair-long')}
                              h="50px"
                              variant={localConfig.hairstyle === 'hair-long' ? 'solid' : 'secondary'}
                            >
                              Ponytail / Mahaba
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('hairstyle', 'hair-curly')}
                              h="50px"
                              variant={localConfig.hairstyle === 'hair-curly' ? 'solid' : 'secondary'}
                            >
                              Pinoy Wavy (Kulot)
                            </Button>
                          </SimpleGrid>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Kulay ng Buhok</Text>
                          <HStack spacing={3}>
                            {colors.hair.map((c) => (
                              <Circle
                                key={c}
                                size="40px"
                                bg={c}
                                cursor="pointer"
                                border={localConfig.hairColor === c ? '3px solid #F7B731' : '1px solid gray'}
                                onClick={() => handleFieldChange('hairColor', c)}
                              />
                            ))}
                          </HStack>
                        </Box>
                      </Stack>
                    </TabPanel>

                    {/* Clothing Panel */}
                    <TabPanel>
                      <Stack spacing={6} py={4}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Kasuotang Damit</Text>
                          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                            <Button
                              onClick={() => handleFieldChange('shirt', 'shirt-default')}
                              h="60px"
                              variant={localConfig.shirt === 'shirt-default' ? 'solid' : 'secondary'}
                            >
                              Barong Tagalog
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('shirt', 'shirt-jersey')}
                              h="60px"
                              variant={localConfig.shirt === 'shirt-jersey' ? 'solid' : 'secondary'}
                            >
                              Sports Jersey (Brgy)
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('shirt', 'shirt-tshirt')}
                              h="60px"
                              variant={localConfig.shirt === 'shirt-tshirt' ? 'solid' : 'secondary'}
                            >
                              Classic Palaro T-Shirt
                            </Button>
                          </SimpleGrid>
                        </Box>

                        {localConfig.shirt !== 'shirt-default' && (
                          <Box>
                            <Text fontWeight="bold" mb={3}>Kulay ng Damit</Text>
                            <HStack spacing={3}>
                              {colors.shirt.map((c) => (
                                <Circle
                                  key={c}
                                  size="40px"
                                  bg={c}
                                  cursor="pointer"
                                  border={localConfig.shirtColor === c ? '3px solid #F7B731' : '1px solid gray'}
                                  onClick={() => handleFieldChange('shirtColor', c)}
                                />
                              ))}
                            </HStack>
                          </Box>
                        )}

                        <Box>
                          <Text fontWeight="bold" mb={3}>Kulay ng Short / Pantalon</Text>
                          <HStack spacing={3}>
                            {colors.pants.map((c) => (
                              <Circle
                                key={c}
                                size="40px"
                                bg={c}
                                cursor="pointer"
                                border={localConfig.pantsColor === c ? '3px solid #F7B731' : '1px solid gray'}
                                onClick={() => handleFieldChange('pantsColor', c)}
                              />
                            ))}
                          </HStack>
                        </Box>
                      </Stack>
                    </TabPanel>

                    {/* Accessories Panel */}
                    <TabPanel>
                      <Stack spacing={6} py={4}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Mga Accessory</Text>
                          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                            <Button
                              onClick={() => handleFieldChange('accessories', 'none')}
                              h="60px"
                              variant={localConfig.accessories === 'none' ? 'solid' : 'secondary'}
                            >
                              Walang Accessory
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('accessories', 'accessory-salakot')}
                              h="60px"
                              variant={localConfig.accessories === 'accessory-salakot' ? 'solid' : 'secondary'}
                            >
                              Katutubong Salakot Hat
                            </Button>
                            <Button
                              onClick={() => handleFieldChange('accessories', 'accessory-bandana')}
                              h="60px"
                              variant={localConfig.accessories === 'accessory-bandana' ? 'solid' : 'secondary'}
                            >
                              Katipunan Bandana
                            </Button>
                          </SimpleGrid>
                        </Box>
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Box>
    </MainLayout>
  );
};

export default CharacterEditor;
