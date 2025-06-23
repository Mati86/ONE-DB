import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import PowerAlarmSettingField from '../../common-components/PowerAlarmSettingField';

function AlarmSettings({ form, onSave, onChange, edfaType }) {
  return (
    <Box my={2}>
      <Typography variant='h6'>Alarm Thresholds</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PowerAlarmSettingField
            onSave={() => onSave(EDFA_PARAMS.OpticalLooThreshold)}
            name={EDFA_PARAMS.OpticalLooThreshold}
            value={form[EDFA_PARAMS.OpticalLooThreshold]}
            onChange={onChange}
            label='Optical loo threshold'
            unit='dBm'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(EDFA_PARAMS.OpticalLooHysteresis)}
            name={EDFA_PARAMS.OpticalLooHysteresis}
            value={form[EDFA_PARAMS.OpticalLooHysteresis]}
            onChange={onChange}
            label='Optical loo hysteresis'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(EDFA_PARAMS.InputOverloadThreshold)}
            name={EDFA_PARAMS.InputOverloadThreshold}
            value={form[EDFA_PARAMS.InputOverloadThreshold]}
            onChange={onChange}
            label='Input overload threshold'
            unit='dBm'
          />
          <PowerAlarmSettingField
            onSave={() => onSave(EDFA_PARAMS.InputOverloadHysteresis)}
            name={EDFA_PARAMS.InputOverloadHysteresis}
            value={form[EDFA_PARAMS.InputOverloadHysteresis]}
            onChange={onChange}
            label='Input overload hysteresis'
          />
          {edfaType === EDFA_TYPE.Booster && (
            <>
              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.InputLowDegradeThreshold)}
                name={EDFA_PARAMS.InputLowDegradeThreshold}
                value={form[EDFA_PARAMS.InputLowDegradeThreshold]}
                onChange={onChange}
                label='Input low degrade threshold'
                unit='dBm'
              />
              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.InputLowDegradeHysteresis)}
                name={EDFA_PARAMS.InputLowDegradeHysteresis}
                value={form[EDFA_PARAMS.InputLowDegradeHysteresis]}
                onChange={onChange}
                label='Input low degrade hysteresis'
              />
              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.OpticalLosThreshold)}
                name={EDFA_PARAMS.OpticalLosThreshold}
                value={form[EDFA_PARAMS.OpticalLosThreshold]}
                onChange={onChange}
                label='Optical los threshold'
                unit='dBm'
              />
              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.OpticalLosHysteresis)}
                name={EDFA_PARAMS.OpticalLosHysteresis}
                value={form[EDFA_PARAMS.OpticalLosHysteresis]}
                onChange={onChange}
                label='Optical los hysteresis'
              />

              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.OrlThresholdWarningThreshold)}
                name={EDFA_PARAMS.OrlThresholdWarningThreshold}
                value={form[EDFA_PARAMS.OrlThresholdWarningThreshold]}
                onChange={onChange}
                label='Orl threshold warning threshold'
                unit='dBm'
              />
              <PowerAlarmSettingField
                onSave={() => onSave(EDFA_PARAMS.OrlThresholdWarningHysteresis)}
                name={EDFA_PARAMS.OrlThresholdWarningHysteresis}
                value={form[EDFA_PARAMS.OrlThresholdWarningHysteresis]}
                onChange={onChange}
                label='Orl threshold warning hysteresis'
              />
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default AlarmSettings;
