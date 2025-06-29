import { Box, MenuItem, Select, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCurrentDeviceId, getDevices, setCurrentDeviceId } from '../../../utils/utils';

const Navbar = () => {
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState('');

  useEffect(() => {
    const updateDeviceList = () => {
      const deviceList = getDevices();
      setDevices(deviceList);
      setCurrentDevice(getCurrentDeviceId() || '');
    };

    // Initial load
    updateDeviceList();

    // Listen for device change events
    const handleDeviceChange = () => {
      updateDeviceList();
    };

    window.addEventListener('deviceChange', handleDeviceChange);
    return () => window.removeEventListener('deviceChange', handleDeviceChange);
  }, []);

  function handleDeviceChange(e) {
    const deviceId = e.target.value;
    setCurrentDevice(deviceId);
    setCurrentDeviceId(deviceId);
    // Note: Page reload removed for better UX - components will react to device changes automatically
  }

  const selectedDevice = devices.find(d => d.id === currentDevice);

  return (
    <Box
      sx={{
        height: '50px',
        borderBottom: '0.5px solid rgb(231, 228, 228)',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#555',
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2' color='textSecondary'>
            Current Device:
          </Typography>
          <Select
            value={currentDevice}
            onChange={handleDeviceChange}
            displayEmpty
            size='small'
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=''>
              <em>No device selected</em>
            </MenuItem>
            {devices.map(device => (
              <MenuItem key={device.id} value={device.id}>
                {device.name} ({device.credentials.ip})
              </MenuItem>
            ))}
          </Select>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {selectedDevice && (
            <Typography variant='body2' color='primary'>
              Connected to: {selectedDevice.name}
            </Typography>
          )}
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 20,
              position: 'relative',
            }}
          >
            <img
              src='https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
              alt=''
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                position: 'absolute',
              }}
            />
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
