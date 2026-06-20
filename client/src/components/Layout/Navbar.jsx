import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  HStack,
  Progress,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { LucideGamepad2, LucideUsers, LucideHistory, LucideTrophy, LucideHome } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useLanguageStore from '../../store/languageStore';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguageStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navBg = useColorModeValue('rgba(250, 250, 245, 0.8)', 'rgba(13, 17, 23, 0.8)');
  const borderBottomColor = useColorModeValue('gray.200', 'gray.800');

  // Simple level progress calculation
  const xpInCurrentLevel = user ? user.xp % 1000 : 0;
  const xpProgress = (xpInCurrentLevel / 1000) * 100;

  return (
    <Box
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={100}
      bg={navBg}
      backdropFilter="blur(12px) saturate(180%)"
      borderBottom="1px solid"
      borderBottomColor={borderBottomColor}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Logo */}
        <RouterLink to="/">
          <HStack spacing={2} cursor="pointer">
            <Box
              bg="brand.gold"
              p={2}
              borderRadius="xl"
              boxShadow="0 4px 12px rgba(247, 183, 49, 0.4)"
            >
              <LucideGamepad2 size={24} color="#0d1117" />
            </Box>
            <Text
              fontSize="2xl"
              fontFamily="heading"
              fontWeight="extrabold"
              letterSpacing="tight"
              bgGradient="linear(to-r, brand.gold, brand.red)"
              bgClip="text"
            >
              Palaro
            </Text>
          </HStack>
        </RouterLink>

        {/* Navigation links */}
        {isAuthenticated && (
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <RouterLink to="/dashboard">
              <Button variant="ghost" leftIcon={<LucideHome size={18} />}>
                {t('dashboard')}
              </Button>
            </RouterLink>
            <RouterLink to="/playground">
              <Button variant="ghost" leftIcon={<LucideUsers size={18} />}>
                {t('playground')}
              </Button>
            </RouterLink>
            <RouterLink to="/games">
              <Button variant="ghost" leftIcon={<LucideGamepad2 size={18} />}>
                {t('games')}
              </Button>
            </RouterLink>
            <RouterLink to="/leaderboard">
              <Button variant="ghost" leftIcon={<LucideTrophy size={18} />}>
                {t('leaderboards')}
              </Button>
            </RouterLink>
          </HStack>
        )}

        {/* Actions / User Profile Menu */}
        <Flex alignItems="center">
          <Stack direction="row" spacing={3} alignItems="center">
            
            {/* Real-time Language Switcher */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="md"
                borderRadius="xl"
                leftIcon={<span>{language === 'fil' ? '🇵🇭' : '🇺🇸'}</span>}
              >
                {language === 'fil' ? 'FIL' : 'EN'}
              </MenuButton>
              <MenuList bg={useColorModeValue('white', 'brand.bahayKubo')}>
                <MenuItem onClick={() => setLanguage('fil')}>
                  🇵🇭 Filipino (Tagalog)
                </MenuItem>
                <MenuItem onClick={() => setLanguage('en')}>
                  🇺🇸 English
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Color mode toggle */}
            <IconButton
              size="md"
              variant="ghost"
              aria-label="Toggle Theme"
              onClick={toggleColorMode}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            />

            {isAuthenticated && user ? (
              <HStack spacing={4}>
                {/* Level details */}
                <Box display={{ base: 'none', sm: 'block' }} textAlign="right">
                  <HStack spacing={1} justifyContent="flex-end">
                    <Badge colorScheme="yellow" variant="solid" borderRadius="full" px={2}>
                      {t('level')} {user.level}
                    </Badge>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500">
                      {xpInCurrentLevel}/1000 {t('xpText')}
                    </Text>
                  </HStack>
                  <Progress
                    value={xpProgress}
                    size="xs"
                    colorScheme="yellow"
                    borderRadius="full"
                    w="100px"
                    mt={1}
                  />
                </Box>

                {/* Avatar menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                  >
                    <Avatar
                      size="md"
                      name={user.username}
                      src={user.avatar || 'https://bit.ly/broken-link'}
                      border="2px solid"
                      borderColor="brand.gold"
                    />
                  </MenuButton>
                  <MenuList bg={useColorModeValue('white', 'brand.bahayKubo')}>
                    <MenuItem onClick={() => navigate('/profile')}>
                      {t('profile')}
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/character-editor')}>
                      {t('customizeAvatar')}
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/collection-book')}>
                      {t('collectionBook')}
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/family-dashboard')}>
                      {t('familyDashboard')}
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/settings')}>
                      {t('settings')}
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} color="brand.red">
                      {t('logout')}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <Stack direction="row" spacing={3}>
                <RouterLink to="/login">
                  <Button variant="ghost">{t('login')}</Button>
                </RouterLink>
                <RouterLink to="/register">
                  <Button variant="solid">{t('getStarted')}</Button>
                </RouterLink>
              </Stack>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
export { Navbar };
