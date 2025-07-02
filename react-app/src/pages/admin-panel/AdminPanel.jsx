import { Box, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCurrentDeviceId, getDeviceCredentials } from '../../utils/utils';
import Layout from '../common-components/Layout';
import AddDependenciesSection from './AddDependenciesSection';
import AddYangModulesSection from './AddYangModulesSection';
import DeviceManager from './DeviceManager';

function AdminPanel() {
  const [yangModules, setYangModules] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(getCurrentDeviceId());

  function handleDeviceChange(deviceId) {
    setCurrentDeviceId(deviceId);
    
    if (deviceId) {
      // Load device-specific yang modules
      const deviceYangModules = localStorage.getItem(`yangModules_${deviceId}`);
      if (deviceYangModules) {
        setYangModules(JSON.parse(deviceYangModules));
      } else {
        setYangModules([]);
      }
    } else {
      setYangModules([]);
    }
  }

  useEffect(() => {
    // Initialize with current device if exists
    if (currentDeviceId) {
      handleDeviceChange(currentDeviceId);
    } else {
      // Legacy fallback only when no current device
      const locallyStoredYangModules = localStorage.getItem('yangModules');
      if (locallyStoredYangModules) {
        setYangModules(JSON.parse(locallyStoredYangModules));
      }
    }
  }, [currentDeviceId]);

  return (
    <Layout requireDevice={false}>
      <Box sx={{ padding: '40px' }}>
        <DeviceManager onDeviceChange={handleDeviceChange} />
        <Divider sx={{ my: 4 }} />
        
        {currentDeviceId && (
          <>
            <AddYangModulesSection
              yangModules={yangModules}
              setYangModules={setYangModules}
              deviceCredentials={getDeviceCredentials(currentDeviceId)}
              currentDeviceId={currentDeviceId}
            />
            <Divider sx={{ my: 4 }} />
            <AddDependenciesSection
              yangModules={yangModules}
              deviceCredentials={getDeviceCredentials(currentDeviceId)}
              currentDeviceId={currentDeviceId}
            />
          </>
        )}
      </Box>
    </Layout>
  );
}

export default AdminPanel;
