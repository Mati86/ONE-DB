import { Box, List } from '@mui/material';
import React from 'react';
import { OPTICAL_PORT_PARAMS, PORT_TYPE } from '../../../utils/data';
import OpticalPortMonitoredDataItem from './OpticalPortMonitoredDataItem';

function OpticalPortMonitoredData({
  entityDescription,
  operationalState,
  inputPower,
  outputPower,
  portType,
  monitoredData,
}) {
  return (
    <Box>
      <List>
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.EntityDescription}
          name='Entity Description'
          value={entityDescription}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.OperationalState}
          name='Operational State'
          value={operationalState}
        />
        {portType === PORT_TYPE.Multiplexer && (
          <OpticalPortMonitoredDataItem
            monitoredData={monitoredData}
            dataKey={OPTICAL_PORT_PARAMS.InputPower}
            name='Input Power'
            value={inputPower}
          />
        )}
        {portType === PORT_TYPE.Demultiplexer && (
          <OpticalPortMonitoredDataItem
            monitoredData={monitoredData}
            dataKey={OPTICAL_PORT_PARAMS.OutputPower}
            name='Output Power'
            value={outputPower}
          />
        )}
      </List>
    </Box>
  );
}

export default OpticalPortMonitoredData;
