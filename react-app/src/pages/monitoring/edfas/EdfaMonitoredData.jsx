import { Box, List, Typography } from '@mui/material';
import React from 'react';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import EdfaMonitoredDataItem from './EdfaMonitoredDataItem';

function EdfaMonitoredData({
  inputPower,
  outputPower,
  entityDescription,
  operationalState,
  measuredGain,
  backReflectionPower,
  opticalReturnLoss,
  alsDisabledSecondsRemaining,
  edfaType,
  monitoredData,
}) {
  function getParameterPlottableData(parameterName) {
    return monitoredData.map(data => ({
      name: data.name,
      [parameterName]: data[parameterName],
    }));
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        State Data
      </Typography>
      <Box>
        <List>
          <EdfaMonitoredDataItem
            name='Entity Description'
            value={entityDescription}
          />
          <EdfaMonitoredDataItem
            name='Operational State'
            value={operationalState}
          />
          <EdfaMonitoredDataItem
            dataKey={EDFA_PARAMS.InputPower}
            name='Input Power'
            value={inputPower}
            monitoredData={getParameterPlottableData(EDFA_PARAMS.InputPower)}
          />
          <EdfaMonitoredDataItem
            dataKey={EDFA_PARAMS.OutputPower}
            name='Output Power'
            value={outputPower}
            monitoredData={getParameterPlottableData(EDFA_PARAMS.OutputPower)}
          />
          <EdfaMonitoredDataItem
            dataKey={EDFA_PARAMS.MeasuredGain}
            name='Measured Gain'
            value={measuredGain}
            monitoredData={getParameterPlottableData(EDFA_PARAMS.MeasuredGain)}
            valueRange={[]}
          />
          {edfaType === EDFA_TYPE.Booster && (
            <>
              <EdfaMonitoredDataItem
                dataKey={EDFA_PARAMS.BackReflectionPower}
                name='Back Reflection Power'
                value={backReflectionPower}
                monitoredData={getParameterPlottableData(
                  EDFA_PARAMS.BackReflectionPower
                )}
              />
              <EdfaMonitoredDataItem
                dataKey={EDFA_PARAMS.OpticalReturnLoss}
                name='Optical Return Loss'
                value={opticalReturnLoss}
                monitoredData={getParameterPlottableData(
                  EDFA_PARAMS.OpticalReturnLoss
                )}
              />
              <EdfaMonitoredDataItem
                name='Als disabled seconds remaining'
                value={alsDisabledSecondsRemaining}
              />
            </>
          )}
        </List>
      </Box>
    </Box>
  );
}

export default EdfaMonitoredData;
