import { Box } from '@mui/material';
import React from 'react';
import DeviceGuard from './DeviceGuard';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';

function Layout({ children, requireDevice = true }) {
  return (
    <Box display='flex'>
      <Sidebar />
      <Box sx={{ flex: 6 }}>
        <Navbar />
        {requireDevice ? (
          <DeviceGuard>{children}</DeviceGuard>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}

export default Layout;
