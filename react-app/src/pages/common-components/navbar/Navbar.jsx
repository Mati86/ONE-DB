import { Box, MenuItem, Select, Typography, Chip} from '@mui/material';
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
        height: '60px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#334155',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography 
            variant='body2' 
            sx={{ 
              color: '#64748b',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Current Device:
          </Typography>
          <Select
            value={currentDevice}
            onChange={handleDeviceChange}
            displayEmpty
            size='small'
            sx={{ 
              minWidth: 240,
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#94a3b8',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
              },
              '& .MuiSelect-select': {
                padding: '8px 12px',
              }
            }}
          >
            <MenuItem value=''>
              <em style={{ color: '#94a3b8' }}>No device selected</em>
            </MenuItem>
            {devices.map(device => (
              <MenuItem key={device.id} value={device.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {device.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    ({device.credentials.ip})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          
          {selectedDevice && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label="Connected"
                size="small"
                sx={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    padding: '0 8px',
                  }
                }}
              />
              <Typography 
                variant='body2' 
                sx={{ 
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {selectedDevice.name}
              </Typography>
            </Box>
          )}
          {!selectedDevice && (
            <Chip
              label="Disconnected"
              size="small"
              sx={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '24px',
                '& .MuiChip-label': {
                  padding: '0 8px',
                }
              }}
            />
          )}
        </Box>

        {/* logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/logo.png" 
            alt="ONE Logo" 
            style={{ 
            height: '200px', 
            width: 'auto',
            marginRight: '-50px' // Adjust this value as needed
        }}
  />
</Box>
      </Box>
    </Box>
  );
};

export default Navbar;
