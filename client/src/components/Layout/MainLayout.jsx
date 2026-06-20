import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <Flex direction="column" minH="100vh">
      {/* Top sticky Navbar */}
      <Navbar />

      <Flex flex="1" position="relative">
        {/* Left Sidebar (Only visible on desktop screen sizes) */}
        {showSidebar && <Sidebar />}

        {/* Core content pane */}
        <Box
          flex="1"
          ml={{ base: 0, md: showSidebar ? '260px' : 0 }}
          p={{ base: 4, md: 8 }}
          minH="calc(100vh - 80px - 60px)" // adjust based on navbar & footer heights
          bg="transparent"
          overflowX="hidden"
        >
          {children}
        </Box>
      </Flex>

      {/* Global Footer */}
      <Footer />
    </Flex>
  );
};

export default MainLayout;
