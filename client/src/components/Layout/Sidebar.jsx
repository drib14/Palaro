import React from 'react';
import {
  Box,
  VStack,
  Button,
  useColorModeValue,
  Text,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  LucideLayoutDashboard,
  LucideGamepad2,
  LucideUsers,
  LucideTrophy,
  LucideMapPin,
  LucideBookOpen,
  LucideUsers2,
  LucideSparkles,
} from 'lucide-react';

const Sidebar = () => {
  const { pathname } = useLocation();

  const sidebarBg = useColorModeValue('brand.ricePaper', 'brand.nightMarket');
  const borderRightColor = useColorModeValue('gray.200', 'gray.800');

  const links = [
    { label: 'Dashboard', icon: <LucideLayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Laruan (Playground)', icon: <LucideSparkles size={20} />, path: '/playground' },
    { label: 'Larong Pinoy', icon: <LucideGamepad2 size={20} />, path: '/games' },
    { label: 'Mga Club', icon: <LucideUsers size={20} />, path: '/barangay-clubs' },
    { label: 'Probinsya Rankings', icon: <LucideMapPin size={20} />, path: '/province-rankings' },
    { label: 'Leaderboard', icon: <LucideTrophy size={20} />, path: '/leaderboard' },
    { label: 'Collection Book', icon: <LucideBookOpen size={20} />, path: '/collection-book' },
    { label: 'Aking Pamilya', icon: <LucideUsers2 size={20} />, path: '/family-dashboard' },
  ];

  return (
    <Box
      w="260px"
      pos="fixed"
      h="calc(100vh - 80px)"
      bg={sidebarBg}
      borderRight="1px solid"
      borderRightColor={borderRightColor}
      display={{ base: 'none', md: 'block' }}
      py={6}
      px={4}
      top="80px"
    >
      <VStack spacing={2} align="stretch">
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" px={4} mb={2}>
          Menu
        </Text>
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <RouterLink to={link.path} key={link.path}>
              <Button
                w="100%"
                variant={isActive ? 'solid' : 'ghost'}
                justifyContent="flex-start"
                leftIcon={link.icon}
                colorScheme={isActive ? 'primary' : undefined}
                bg={isActive ? 'brand.gold' : 'transparent'}
                color={isActive ? 'brand.nightMarket' : undefined}
                _hover={isActive ? { bg: '#ffd05c' } : undefined}
                py={6}
                borderRadius="xl"
              >
                {link.label}
              </Button>
            </RouterLink>
          );
        })}
      </VStack>
      <Divider my={6} borderColor={borderRightColor} />
    </Box>
  );
};

export default Sidebar;
