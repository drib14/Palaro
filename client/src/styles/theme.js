import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    gold: '#F7B731',      // Sunburst Gold
    blue: '#1A73E8',      // Terno Blue
    red: '#E74C3C',       // Fiesta Red
    green: '#27AE60',     // Palawan Green
    nightMarket: '#0D1117', // Background Dark
    ricePaper: '#FAFAF5',   // Background Light
    bahayKubo: '#161B22',   // Surface Dark
    surfaceLight: '#FFFFFF',
  },
  // Map standard Chakra scheme names to custom HSL values
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#F7B731', // Brand Gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  secondary: {
    50: '#e8f0fe',
    100: '#c2d7fa',
    200: '#9abdf7',
    300: '#72a3f4',
    400: '#4a89f1',
    500: '#1A73E8', // Brand Blue
    600: '#155db8',
    700: '#10478a',
    800: '#0a325c',
    900: '#051c2e',
  }
};

const fonts = {
  heading: `'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
};

const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'brand.nightMarket' : 'brand.ricePaper',
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      transitionProperty: 'background-color, color',
      transitionDuration: '0.2s',
      overflowX: 'hidden',
    },
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: props.colorMode === 'dark' ? 'brand.nightMarket' : 'brand.ricePaper',
    },
    '::-webkit-scrollbar-thumb': {
      bg: props.colorMode === 'dark' ? 'brand.bahayKubo' : 'gray.300',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'brand.gold',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'xl',
      fontWeight: 'semibold',
      transition: 'all 0.2s cubic-bezier(.08,.52,.52,1)',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.gold' : 'brand.blue',
        color: props.colorMode === 'dark' ? 'brand.nightMarket' : 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? '#ffd05c' : '#155db8',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(1px)',
        },
      }),
      secondary: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.bahayKubo' : 'gray.200',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.300',
        _hover: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.300',
          transform: 'translateY(-1px)',
        },
      }),
      ghost: {
        _hover: {
          bg: 'rgba(247, 183, 49, 0.15)',
          color: 'brand.gold',
        }
      }
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'brand.bahayKubo' : 'brand.surfaceLight',
        borderRadius: '2xl',
        boxShadow: 'xl',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
        overflow: 'hidden',
      },
    }),
  },
  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'brand.nightMarket' : 'gray.50',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
          _focus: {
            borderColor: 'brand.gold',
            bg: props.colorMode === 'dark' ? 'brand.nightMarket' : 'white',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: (props) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'brand.nightMarket' : 'gray.50',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
          _focus: {
            borderColor: 'brand.gold',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
});

export default theme;
