import { Box, Divider, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApiPoll from '../../../hooks/useApiPoll';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import {
  OPTICAL_PORT_PARAMS,
  OPTICAL_PORT_PLOTTABLE_PARAMETERS,
  PORT_TYPE,
} from '../../../utils/data';
import {
  getPortType,
  getReadApiPayloadForPort,
  pickKeys,
  getCurrentDeviceId,
} from '../../../utils/utils';
import Layout from '../../common-components/Layout';
import OpticalPortMonitoredData from './OpticalPortMonitoredData';

function getApiPayload(portNumber) {
  const currentDeviceId = getCurrentDeviceId();
  const parameters = [
    OPTICAL_PORT_PARAMS.EntityDescription,
    OPTICAL_PORT_PARAMS.OperationalState,
  ];
  const portType = getPortType(portNumber);
  if (portType === PORT_TYPE.Multiplexer)
    parameters.push(OPTICAL_PORT_PARAMS.InputPower);
  if (portType === PORT_TYPE.Demultiplexer)
    parameters.push(OPTICAL_PORT_PARAMS.OutputPower);
  return getReadApiPayloadForPort(portNumber, parameters, currentDeviceId);
}

function OpticalPort() {
  const [monitoredData, setMonitoredData] = useState([]);
  const pollInterval = useDataPollInterval();
  const params = useParams();
  const currentDeviceId = getCurrentDeviceId();

  const apiPayload = useMemo(() => {
    if (!currentDeviceId) return null;
    return getApiPayload(params.port);
  }, [params.port, currentDeviceId]);

  const portType = useMemo(() => {
    return getPortType(params.port);
  }, [params.port]);

  const data = useApiPoll(pollInterval, apiPayload);

  useEffect(() => {
    if (data) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: 0,
          ...pickKeys(data.data, Array.from(OPTICAL_PORT_PLOTTABLE_PARAMETERS)),
        });
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            name: (index * (pollInterval / 1000)).toString(),
          };
        });
      });
    }
  }, [data, pollInterval]);

  return (
    <Layout requireDevice={true}>
      <Box sx={{ padding: 5 }}>
        <Typography variant='h4' mb={3}>
          Port {params.port} State
        </Typography>
        <OpticalPortMonitoredData
          entityDescription={data?.data[OPTICAL_PORT_PARAMS.EntityDescription]}
          operationalState={data?.data[OPTICAL_PORT_PARAMS.OperationalState]}
          inputPower={data?.data[OPTICAL_PORT_PARAMS.InputPower]}
          outputPower={data?.data[OPTICAL_PORT_PARAMS.OutputPower]}
          portType={portType}
          monitoredData={monitoredData}
        />

        <Divider />
      </Box>
    </Layout>
  );
}

export default OpticalPort;
