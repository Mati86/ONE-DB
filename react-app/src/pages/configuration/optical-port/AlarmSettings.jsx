import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import { OPTICAL_PORT_PARAMS } from '../../../utils/data';
import PowerAlarmSettingField from '../../common-components/PowerAlarmSettingField';

function AlarmSettings({ form, onSave, onChange }) {
  return (
    <Box my={2}>
      <Typography variant='h6'>Alarm Thresholds</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PowerAlarmSettingField
            onSave={() => onSave(OPTICAL_PORT_PARAMS.InputLowDegradeThreshold)}
            name={OPTICAL_PORT_PARAMS.InputLowDegradeThreshold}
            value={form[OPTICAL_PORT_PARAMS.InputLowDegradeThreshold]}
            onChange={onChange}
            label='Input low degrade threshold'
            unit='dBm'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis)}
            name={OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis}
            value={form[OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis]}
            onChange={onChange}
            label='Input low degrade hysteresis'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(OPTICAL_PORT_PARAMS.OpticalLosThreshold)}
            name={OPTICAL_PORT_PARAMS.OpticalLosThreshold}
            value={form[OPTICAL_PORT_PARAMS.OpticalLosThreshold]}
            onChange={onChange}
            label='Optical los threshold'
            unit='dBm'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(OPTICAL_PORT_PARAMS.OpticalLosHysteresis)}
            name={OPTICAL_PORT_PARAMS.OpticalLosHysteresis}
            value={form[OPTICAL_PORT_PARAMS.OpticalLosHysteresis]}
            onChange={onChange}
            label='Optical los hysteresis'
          />
        </Grid>
      </Box>
    </Box>
  );
}

export default AlarmSettings;
