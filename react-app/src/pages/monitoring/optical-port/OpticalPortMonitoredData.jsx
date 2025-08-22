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
  customName,
  maintenanceState,
  inputLowDegradeThreshold,
  inputLowDegradeHysteresis,
  opticalLosThreshold,
  opticalLosHysteresis,
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
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.CustomName}
          name='Custom Name'
          value={customName}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.MaintenanceState}
          name='Maintenance State'
          value={maintenanceState}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.InputLowDegradeThreshold}
          name='Input Low Degrade Threshold'
          value={inputLowDegradeThreshold}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis}
          name='Input Low Degrade Hysteresis'
          value={inputLowDegradeHysteresis}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.OpticalLosThreshold}
          name='Optical Los Threshold'
          value={opticalLosThreshold}
        />
        <OpticalPortMonitoredDataItem
          monitoredData={monitoredData}
          dataKey={OPTICAL_PORT_PARAMS.OpticalLosHysteresis}
          name='Optical Los Hysteresis'
          value={opticalLosHysteresis}
        />
      </List>
    </Box>
  );
}

export default OpticalPortMonitoredData;
