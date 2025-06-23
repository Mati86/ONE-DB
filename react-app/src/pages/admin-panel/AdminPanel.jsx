import { Box, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getDeviceCredentials, notifySuccess } from '../../utils/utils';
import Layout from '../common-components/Layout';
import AddDependenciesSection from './AddDependenciesSection';
import AddYangModulesSection from './AddYangModulesSection';
import DeviceCredentialsForm from './DeviceCredentialsForm';

function AdminPanel() {
  const [yangModules, setYangModules] = useState([]);
  const [deviceCredentials, setDeviceCredentials] = useState({
    ip: '',
    port: 830,
    username: '',
    password: '',
  });

  const { ip, port, username, password } = deviceCredentials;

  function handleDeviceCredentialsChange(e) {
    const { name, value } = e.target;

    setDeviceCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleDeviceCredentialsSave() {
    localStorage.setItem(
      'deviceCredentials',
      JSON.stringify(deviceCredentials)
    );
    notifySuccess('Device Credentials Saved');
  }

  useEffect(() => {
    const locallyStoredDeviceCredentials = getDeviceCredentials();
    if (locallyStoredDeviceCredentials)
      setDeviceCredentials(locallyStoredDeviceCredentials);
    const locallyStoredYangModules = localStorage.getItem('yangModules');
    if (locallyStoredYangModules) {
      setYangModules(JSON.parse(locallyStoredYangModules));
    }
  }, []);

  return (
    <Layout>
      <Box sx={{ padding: '40px' }}>
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
        />
        <Divider sx={{ my: 4 }} />
        <AddDependenciesSection
          yangModules={yangModules}
          deviceCredentials={deviceCredentials}
        />
      </Box>
    </Layout>
  );
}

export default AdminPanel;
