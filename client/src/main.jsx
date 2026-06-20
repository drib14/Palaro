import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import theme from './styles/theme.js';
import './styles/animations.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </HelmetProvider>
  </React.StrictMode>
);
