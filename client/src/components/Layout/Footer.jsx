import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  useColorModeValue,
  Link,
  HStack,
} from '@chakra-ui/react';
import { LucideHeart } from 'lucide-react';

const Footer = () => {
  const borderTopColor = useColorModeValue('gray.200', 'gray.800');

  return (
    <Box
      bg={useColorModeValue('brand.ricePaper', 'brand.nightMarket')}
      color={useColorModeValue('gray.600', 'gray.400')}
      borderTop="1px solid"
      borderTopColor={borderTopColor}
      py={6}
    >
      <Container
        as={Stack}
        maxW="6xl"
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Text>© {new Date().getFullYear()} Palaro. Made with love for Filipino Heritage.</Text>
        <HStack spacing={1}>
          <Text>Preserving history & play</Text>
          <LucideHeart size={14} fill="#E74C3C" color="#E74C3C" />
          <Text>for future generations.</Text>
        </HStack>
        <Stack direction="row" spacing={6}>
          <Link href="#">Tulong</Link>
          <Link href="#">Kasaysayan</Link>
          <Link href="#">Privacy Policy</Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
