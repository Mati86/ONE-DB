import { Box, Divider, MenuItem, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { configureDeviceData, readDeviceData } from '../../../utils/api';
import { OPTICAL_PORT_PARAMS, PORT_TYPE } from '../../../utils/data';
import {
  getConfigurationApiPayloadForPort,
  getPortType,
  getReadApiPayloadForPort,
  notifySuccess,
  getCurrentDeviceId,
} from '../../../utils/utils';
import Layout from '../../common-components/Layout';
import SaveButton from '../../common-components/SaveButton';
import AlarmSettings from './AlarmSettings';

function getApiPayloadForReadConfigurationData(portNumber, deviceId = null) {
  const result = [
    OPTICAL_PORT_PARAMS.CustomName,
    OPTICAL_PORT_PARAMS.MaintenanceState,
  ];
  const portType = getPortType(portNumber);
  if (portType === PORT_TYPE.Multiplexer)
    result.push(
      OPTICAL_PORT_PARAMS.InputLowDegradeThreshold,
      OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis,
      OPTICAL_PORT_PARAMS.OpticalLosThreshold,
      OPTICAL_PORT_PARAMS.OpticalLosHysteresis
    );

  return getReadApiPayloadForPort(portNumber, result, deviceId);
}

function OpticalPortConfiguration() {
  const { port } = useParams();
  const currentDeviceId = getCurrentDeviceId();

  const [form, setForm] = useState({});

  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(form => ({
      ...form,
      [name]: value,
    }));
  };

  async function handleSaveAll() {
    try {
      // Save all fields with values
      const fieldsToSave = Object.keys(form).filter(key => form[key] !== undefined && form[key] !== '');
      
      for (const fieldName of fieldsToSave) {
        await configureDeviceData(
          getConfigurationApiPayloadForPort(
            port,
            fieldName,
            form[fieldName],
            currentDeviceId
          )
        );
      }
      
      notifySuccess('All port configurations saved successfully');
    } catch (e) {
      toast.error(e.message);
    }
  }

  const apiPayloadForReadConfigurationData = useMemo(() => {
    if (!currentDeviceId) return null;
    return getApiPayloadForReadConfigurationData(port, currentDeviceId);
  }, [port, currentDeviceId]);

  const portType = useMemo(() => getPortType(port), [port]);

  // get Port configuration data
  useEffect(() => {
    async function getEdfaData() {
      try {
        const data = await readDeviceData(apiPayloadForReadConfigurationData);
        setForm(data.data);
      } catch (e) {
        toast.error(e.message);
      }
    }

    getEdfaData();
  }, [apiPayloadForReadConfigurationData]);

  return (
    <Layout requireDevice={true}>
      <Box p={4}>
        <Typography variant='h4' mb={3}>
          Port: {port}
        </Typography>
        <Box>
          <Box display='flex'>
            <TextField
              size='small'
              label='Custom name'
              name={OPTICAL_PORT_PARAMS.CustomName}
              value={form[OPTICAL_PORT_PARAMS.CustomName] ?? ''}
              fullWidth
              onChange={handleInputChange}
            />
          </Box>

          <Box display='flex' sx={{ mt: 2 }}>
            <TextField
              size='small'
              label='Maintenance state'
              select
              fullWidth
              name={OPTICAL_PORT_PARAMS.MaintenanceState}
              value={form[OPTICAL_PORT_PARAMS.MaintenanceState] ?? ''}
              onChange={handleInputChange}
            >
              <MenuItem value='in-service'>In service</MenuItem>
              <MenuItem value='out-of-service'>Out of service</MenuItem>
            </TextField>
          </Box>
        </Box>
        {portType === PORT_TYPE.Multiplexer && (
          <>
            <Divider sx={{ my: 4 }} />
            <AlarmSettings
              form={form}
              onChange={handleInputChange}
            />
          </>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <SaveButton onClick={handleSaveAll}>Save All</SaveButton>
        </Box>
        
        {/* 
        <Divider />
        <LLDPSettings /> */}
      </Box>
    </Layout>
  );
}

export default OpticalPortConfiguration;
