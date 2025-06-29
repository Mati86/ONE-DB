import { Box, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCurrentDeviceId, getDeviceCredentials, getDevices, saveDevices, notifySuccess } from '../../utils/utils';
import { toast } from 'react-hot-toast';
import Layout from '../common-components/Layout';
import AddDependenciesSection from './AddDependenciesSection';
import AddYangModulesSection from './AddYangModulesSection';
import DeviceCredentialsForm from './DeviceCredentialsForm';
import DeviceManager from './DeviceManager';

function AdminPanel() {
  const [yangModules, setYangModules] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(getCurrentDeviceId());
  const [deviceCredentials, setDeviceCredentials] = useState({
    ip: '',
    port: 830,
    username: '',
    password: '',
  });

  const { ip, port, username, password } = deviceCredentials;

  function handleDeviceChange(deviceId) {
    setCurrentDeviceId(deviceId);
    
    if (deviceId) {
      const credentials = getDeviceCredentials(deviceId);
      if (credentials) {
        setDeviceCredentials(credentials);
      }
      
      // Load device-specific yang modules
      const deviceYangModules = localStorage.getItem(`yangModules_${deviceId}`);
      if (deviceYangModules) {
        setYangModules(JSON.parse(deviceYangModules));
      } else {
        setYangModules([]);
      }
    } else {
      setDeviceCredentials({
        ip: '',
        port: 830,
        username: '',
        password: '',
      });
      setYangModules([]);
    }
  }

  function handleDeviceCredentialsChange(e) {
    const { name, value } = e.target;

    setDeviceCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleDeviceCredentialsSave() {
    if (currentDeviceId) {
      // Update device credentials in the devices array
      const devices = getDevices();
      const deviceIndex = devices.findIndex(d => d.id === currentDeviceId);
      if (deviceIndex !== -1) {
        devices[deviceIndex].credentials = deviceCredentials;
        saveDevices(devices);
        notifySuccess('Device Credentials Saved');
      } else {
        toast.error('Device not found');
      }
    } else {
      // Legacy fallback for backward compatibility
      localStorage.setItem(
        'deviceCredentials',
        JSON.stringify(deviceCredentials)
      );
      notifySuccess('Device Credentials Saved');
    }
  }

  useEffect(() => {
    // Initialize with current device if exists - handleDeviceChange will be called
    // when currentDeviceId changes, so we don't need to duplicate the logic here
    if (currentDeviceId) {
      handleDeviceChange(currentDeviceId);
    } else {
      // Legacy fallback only when no current device
      const locallyStoredDeviceCredentials = getDeviceCredentials();
      if (locallyStoredDeviceCredentials)
        setDeviceCredentials(locallyStoredDeviceCredentials);
      const locallyStoredYangModules = localStorage.getItem('yangModules');
      if (locallyStoredYangModules) {
        setYangModules(JSON.parse(locallyStoredYangModules));
      }
    }
  }, [currentDeviceId]); // Only run on mount

  return (
    <Layout requireDevice={false}>
      <Box sx={{ padding: '40px' }}>
        <DeviceManager onDeviceChange={handleDeviceChange} />
        <Divider sx={{ my: 4 }} />
        
        {currentDeviceId && (
          <>
            <DeviceCredentialsForm
              ip={ip}
              port={port}
              username={username}
              password={password}
              onChange={handleDeviceCredentialsChange}
              onSave={handleDeviceCredentialsSave}
            />
            <Divider sx={{ my: 4 }} />
            <AddYangModulesSection
              yangModules={yangModules}
              setYangModules={setYangModules}
              deviceCredentials={deviceCredentials}
              currentDeviceId={currentDeviceId}
            />
            <Divider sx={{ my: 4 }} />
            <AddDependenciesSection
              yangModules={yangModules}
              deviceCredentials={deviceCredentials}
              currentDeviceId={currentDeviceId}
            />
          </>
        )}
      </Box>
    </Layout>
  );
}

export default AdminPanel;
