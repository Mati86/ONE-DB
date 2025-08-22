import { Box, Divider, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRedisMonitoringData, getRedisOperationalConfig } from '../../../utils/api';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import {
  OPTICAL_PORT_PARAMS,
  OPTICAL_PORT_PLOTTABLE_PARAMETERS,
  PORT_TYPE,
} from '../../../utils/data';
import {
  getPortType,
  getCurrentDeviceId,
} from '../../../utils/utils';
import Layout from '../../common-components/Layout';
import OpticalPortMonitoredData from './OpticalPortMonitoredData';



async function fetchData(portNumber, currentDeviceId) {
  const portType = getPortType(portNumber);
  // Construct the precise component name that matches how data is stored in Redis
  const componentName = `optical-port-${portType === PORT_TYPE.Multiplexer ? 'mux' : 'demux'}-${portNumber}`;

  // Define individual monitoring parameters to fetch
  const monitoringParamsToFetch = [
    OPTICAL_PORT_PARAMS.EntityDescription,
    OPTICAL_PORT_PARAMS.OperationalState,
  ];

  // Add input/output power based on port type
  if (portType === PORT_TYPE.Multiplexer) {
    monitoringParamsToFetch.push(OPTICAL_PORT_PARAMS.InputPower);
  } else if (portType === PORT_TYPE.Demultiplexer) {
    monitoringParamsToFetch.push(OPTICAL_PORT_PARAMS.OutputPower);
  }

  // Fetch each monitoring parameter individually
  const monitoringDataPromises = monitoringParamsToFetch.map(param =>
    getRedisMonitoringData(currentDeviceId, componentName, param)
  );

  const monitoringResults = await Promise.all(monitoringDataPromises);

  let monitoringValues = {};
  monitoringResults.forEach((res, index) => {
    if (res?.data?.value !== undefined) {
      monitoringValues[monitoringParamsToFetch[index]] = res.data.value;
    }
  });

  // Fetch individual operational configuration data (this part was already correct in logic)
  const operationalConfigParams = [
    OPTICAL_PORT_PARAMS.CustomName,
    OPTICAL_PORT_PARAMS.MaintenanceState,
    OPTICAL_PORT_PARAMS.InputLowDegradeThreshold,
    OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis,
    OPTICAL_PORT_PARAMS.OpticalLosThreshold,
    OPTICAL_PORT_PARAMS.OpticalLosHysteresis,
  ];

  const operationalConfigPromises = operationalConfigParams.map(param =>
    getRedisOperationalConfig(currentDeviceId, componentName, param)
  );

  const operationalConfigResults = await Promise.all(operationalConfigPromises);

  let operationalConfigValues = {};
  operationalConfigResults.forEach((res, index) => {
    if (res?.data?.value !== undefined) {
      operationalConfigValues[operationalConfigParams[index]] = res.data.value;
    }
  });

  // Merge all fetched values
  return { ...monitoringValues, ...operationalConfigValues };
}

function OpticalPort() {
  const [monitoredData, setMonitoredData] = useState([]);
  const [currentPortData, setCurrentPortData] = useState(null);
  const pollInterval = useDataPollInterval();
  const params = useParams();
  const currentDeviceId = getCurrentDeviceId();

  const portType = useMemo(() => {
    return getPortType(params.port);
  }, [params.port]);

  useEffect(() => {
    let intervalId;
    if (pollInterval && currentDeviceId) {
      const poll = async () => {
        const data = await fetchData(params.port, currentDeviceId);
        setCurrentPortData({ data });
      };
      poll(); // Initial fetch
      intervalId = setInterval(poll, pollInterval);
    }
    return () => clearInterval(intervalId);
  }, [pollInterval, params.port, currentDeviceId]);

  useEffect(() => {
    if (currentPortData) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: newData.length,
          ...currentPortData.data,
        });
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            name: index * (pollInterval / 1000),
          };
        });
      });
    }
  }, [currentPortData, pollInterval]);

  return (
    <Layout requireDevice={true}>
      <Box sx={{ padding: 5 }}>
        <Typography variant='h4' mb={3}>
          Port {params.port} State
        </Typography>
        <OpticalPortMonitoredData
          entityDescription={currentPortData?.data[OPTICAL_PORT_PARAMS.EntityDescription]}
          operationalState={currentPortData?.data[OPTICAL_PORT_PARAMS.OperationalState]}
          inputPower={currentPortData?.data[OPTICAL_PORT_PARAMS.InputPower]}
          outputPower={currentPortData?.data[OPTICAL_PORT_PARAMS.OutputPower]}
          customName={currentPortData?.data[OPTICAL_PORT_PARAMS.CustomName]}
          maintenanceState={currentPortData?.data[OPTICAL_PORT_PARAMS.MaintenanceState]}
          inputLowDegradeThreshold={currentPortData?.data[OPTICAL_PORT_PARAMS.InputLowDegradeThreshold]}
          inputLowDegradeHysteresis={currentPortData?.data[OPTICAL_PORT_PARAMS.InputLowDegradeHysteresis]}
          opticalLosThreshold={currentPortData?.data[OPTICAL_PORT_PARAMS.OpticalLosThreshold]}
          opticalLosHysteresis={currentPortData?.data[OPTICAL_PORT_PARAMS.OpticalLosHysteresis]}
          portType={portType}
          monitoredData={monitoredData}
        />

        <Divider />
      </Box>
    </Layout>
  );
}

export default OpticalPort;
