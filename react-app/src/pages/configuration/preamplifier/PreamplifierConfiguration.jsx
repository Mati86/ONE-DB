import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { configureDeviceData, readDeviceData, getRedisRunningConfigBatch } from '../../../utils/api';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import {
  getConfigurationApiPayloadForEdfa,
  getReadApiPayloadForEdfa,
  notifySuccess,
  getCurrentDeviceId,
} from '../../../utils/utils';
import Layout from '../../common-components/Layout';
import SaveButton from '../../common-components/SaveButton';
import AlarmSettings from '../edfa/AlarmSettings';

function PreamplifierConfiguration() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const currentDeviceId = getCurrentDeviceId();

  const apiPayloadForReadConfigurationData = useMemo(() => {
    if (!currentDeviceId) return null;
    return getReadApiPayloadForEdfa(
      EDFA_TYPE.Preamplifier,
      [
        EDFA_PARAMS.CustomName,
        EDFA_PARAMS.MaintenanceState,
        EDFA_PARAMS.ControlMode,
        EDFA_PARAMS.GainSwitchMode,
        EDFA_PARAMS.TargetGain,
        EDFA_PARAMS.TargetPower,
        EDFA_PARAMS.TargetGainTilt,
        EDFA_PARAMS.LosShutdown,
        EDFA_PARAMS.OpticalLooThreshold,
        EDFA_PARAMS.OpticalLooHysteresis,
        EDFA_PARAMS.InputOverloadThreshold,
        EDFA_PARAMS.InputOverloadHysteresis,
        EDFA_PARAMS.ForceApr,
      ],
      currentDeviceId
    );
  }, [currentDeviceId]);

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
          getConfigurationApiPayloadForEdfa(
            EDFA_TYPE.Preamplifier,
            fieldName,
            form[fieldName],
            getCurrentDeviceId()
          )
        );
      }
      
      notifySuccess('All preamplifier configurations saved successfully');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleSaveAllAlarms() {
    try {
      // Alarm-related fields
      const alarmFields = [
        EDFA_PARAMS.OpticalLooThreshold,
        EDFA_PARAMS.OpticalLooHysteresis,
        EDFA_PARAMS.InputOverloadThreshold,
        EDFA_PARAMS.InputOverloadHysteresis,
      ];
      
      const fieldsToSave = alarmFields.filter(key => form[key] !== undefined && form[key] !== '');
      
      for (const fieldName of fieldsToSave) {
        await configureDeviceData(
          getConfigurationApiPayloadForEdfa(
            EDFA_TYPE.Preamplifier,
            fieldName,
            form[fieldName],
            getCurrentDeviceId()
          )
        );
      }
      
      notifySuccess('All preamplifier alarm settings saved successfully');
    } catch (e) {
      toast.error(e.message);
    }
  }

  // Load configuration data from Redis first, then fallback to device
  useEffect(() => {
    async function loadConfigurationData() {
      if (!currentDeviceId) return;
      
      setLoading(true);
      try {
        // First try to get running configuration from Redis
        const redisData = await getRedisRunningConfigBatch(
          currentDeviceId,
          'edfa-preamplifier',
          [
            EDFA_PARAMS.CustomName,
            EDFA_PARAMS.MaintenanceState,
            EDFA_PARAMS.ControlMode,
            EDFA_PARAMS.GainSwitchMode,
            EDFA_PARAMS.TargetGain,
            EDFA_PARAMS.TargetPower,
            EDFA_PARAMS.TargetGainTilt,
            EDFA_PARAMS.LosShutdown,
            EDFA_PARAMS.OpticalLooThreshold,
            EDFA_PARAMS.OpticalLooHysteresis,
            EDFA_PARAMS.InputOverloadThreshold,
            EDFA_PARAMS.InputOverloadHysteresis,
            EDFA_PARAMS.ForceApr,
          ]
        );

        // If Redis has data, use it
        if (redisData && redisData.data && Object.keys(redisData.data).length > 0) {
          setForm(redisData.data);
          console.log('Loaded configuration from Redis cache');
        } else {
          // Fallback to device data
          const deviceData = await readDeviceData(apiPayloadForReadConfigurationData);
          setForm(deviceData.data);
          console.log('Loaded configuration from device');
        }
      } catch (e) {
        console.error('Error loading configuration:', e);
        toast.error('Failed to load configuration data');
      } finally {
        setLoading(false);
      }
    }

    loadConfigurationData();
  }, [currentDeviceId, apiPayloadForReadConfigurationData]);

  if (loading) {
    return (
      <Layout requireDevice={true}>
        <Box sx={{ padding: 5, textAlign: 'center' }}>
          <Typography variant='h6'>Loading configuration...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout requireDevice={true}>
      <Box sx={{ padding: 5 }}>
        <Typography variant='h4' mb={3}>
          Preamplifier Configuration
        </Typography>

        <Box>
          <Grid container spacing={3} sx={{ marginTop: 0 }}>
            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Custom name'
                name={EDFA_PARAMS.CustomName}
                value={form[EDFA_PARAMS.CustomName] ?? ''}
                fullWidth
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Maintenance State'
                name={EDFA_PARAMS.MaintenanceState}
                value={form[EDFA_PARAMS.MaintenanceState] ?? ''}
                select
                fullWidth
                onChange={handleInputChange}
              >
                <MenuItem value='in-service'>In service</MenuItem>
                <MenuItem value='out-of-service'>Out of service</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Control Mode'
                name={EDFA_PARAMS.ControlMode}
                value={form[EDFA_PARAMS.ControlMode] ?? ''}
                select
                fullWidth
                onChange={handleInputChange}
              >
                <MenuItem value='constant-gain'>Constant gain</MenuItem>
                <MenuItem value='constant-power'>Constant power</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Gain switch mode'
                name={EDFA_PARAMS.GainSwitchMode}
                value={form[EDFA_PARAMS.GainSwitchMode] ?? ''}
                select
                fullWidth
                onChange={handleInputChange}
              >
                <MenuItem value='low-gain'>Low gain</MenuItem>
                <MenuItem value='high-power'>High power</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Target gain'
                name={EDFA_PARAMS.TargetGain}
                value={form[EDFA_PARAMS.TargetGain] ?? ''}
                type='number'
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment>dB</InputAdornment>,
                }}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Target power'
                name={EDFA_PARAMS.TargetPower}
                value={form[EDFA_PARAMS.TargetPower]}
                type='number'
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment>dBm</InputAdornment>,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={7} display='flex'>
              <TextField
                size='small'
                label='Target gain tilt'
                name={EDFA_PARAMS.TargetGainTilt}
                value={form[EDFA_PARAMS.TargetGainTilt]}
                type='number'
                fullWidth
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment>dB</InputAdornment>,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ mb: 3, justifyContent: 'space-between' }}
              md={7}
              display='flex'
            >
              <Grid item xs={12} md={7} display='flex'>
                <FormControlLabel
                  label='Enable los shutdown'
                  name={EDFA_PARAMS.LosShutdown}
                  control={
                    <Checkbox
                      checked={form[EDFA_PARAMS.LosShutdown] === 'on'}
                    />
                  }
                  onChange={handleInputChange}
                />
                {/* <SaveButton
                    onClick={() => handleSave(EDFA_PARAMS.LosShutdown)}
                  /> */}
              </Grid>
              <Grid item xs={12} md={7} display='flex'>
                <FormControlLabel
                  label='Force APR mode'
                  name={EDFA_PARAMS.ForceApr}
                  control={
                    <Checkbox checked={form[EDFA_PARAMS.ForceApr] === 'on'} />
                  }
                  onChange={handleInputChange}
                />
                {/* <SaveButton
                    onClick={() => handleSave(EDFA_PARAMS.ForceApr)}
                  /> */}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Save All Button for Main Configuration */}
        <Box sx={{ mt: 3, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <SaveButton onClick={handleSaveAll}>Save All Configuration</SaveButton>
        </Box>

        {/* <Divider />
          <ReadOnlyData /> */}
        <Divider sx={{ my: 3 }} />
        <AlarmSettings
          edfaType={EDFA_TYPE.Preamplifier}
          form={form}
          onChange={handleInputChange}
        />
        
        {/* Save All Button for Alarm Settings */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <SaveButton onClick={handleSaveAllAlarms}>Save All Alarms</SaveButton>
        </Box>
        {/* <Divider />
          <VoaSettings />
          <Divider />
          <PumpSettings />
          <Divider />
          <CoilsSettings /> */}
      </Box>
    </Layout>
  );
}

export default PreamplifierConfiguration;
