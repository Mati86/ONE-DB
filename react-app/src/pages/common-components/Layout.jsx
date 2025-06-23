import { Box } from '@mui/material';
import React from 'react';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';

function Layout({ children }) {
  return (
    <Box display='flex'>
      <Sidebar />
      <Box sx={{ flex: 6 }}>
        <Navbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
