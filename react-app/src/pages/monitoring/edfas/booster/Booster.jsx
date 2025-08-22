import { Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { getRedisMonitoringData } from '../../../../utils/api';
import useDataPollInterval from '../../../../hooks/useDataPollInterval';
import {
  EDFA_PARAMS,
  EDFA_PLOTTABLE_PARAMETERS,
  EDFA_TYPE,
} from '../../../../utils/data';
import { getCurrentDeviceId } from '../../../../utils/utils';
import Layout from '../../../common-components/Layout';
import EdfaMonitoredData from '../EdfaMonitoredData';

async function fetchBoosterData(currentDeviceId) {
  const paramsToFetch = [
    EDFA_PARAMS.EntityDescription,
    EDFA_PARAMS.OperationalState,
    EDFA_PARAMS.InputPower,
    EDFA_PARAMS.OutputPower,
    EDFA_PARAMS.MeasuredGain,
    EDFA_PARAMS.BackReflectionPower,
    EDFA_PARAMS.OpticalReturnLoss,
    EDFA_PARAMS.AlsDisabledSecondsRemaining,
  ];

  const dataPromises = paramsToFetch.map(param =>
    getRedisMonitoringData(currentDeviceId, `edfa-${EDFA_TYPE.Booster}`, param)
  );

  const results = await Promise.all(dataPromises);
  
  const fetchedData = {};
  results.forEach((res, index) => {
    if (res?.data?.value !== undefined) {
      fetchedData[paramsToFetch[index]] = res.data.value;
    }
  });
  return fetchedData;
}

function Booster() {
  const [monitoredData, setMonitoredData] = useState([]);
  const [currentEdfaData, setCurrentEdfaData] = useState(null);
  const pollInterval = useDataPollInterval();
  const currentDeviceId = getCurrentDeviceId();

  useEffect(() => {
    let intervalId;
    if (pollInterval && currentDeviceId) {
      const poll = async () => {
        const data = await fetchBoosterData(currentDeviceId);
        setCurrentEdfaData(data);
      };
      poll(); // Initial fetch
      intervalId = setInterval(poll, pollInterval);
    }
    return () => clearInterval(intervalId);
  }, [pollInterval, currentDeviceId]);

  useEffect(() => {
    if (currentEdfaData) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: 0,
          ...currentEdfaData,
        });
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            name: (index * (pollInterval / 1000)).toString(),
          };
        });
      });
    }
  }, [currentEdfaData, pollInterval]);

  return (
    <Layout requireDevice={true}>
      <Box sx={{ padding: 5 }}>
        <EdfaMonitoredData
          inputPower={currentEdfaData?.[EDFA_PARAMS.InputPower]}
          outputPower={currentEdfaData?.[EDFA_PARAMS.OutputPower]}
          entityDescription={currentEdfaData?.[EDFA_PARAMS.EntityDescription]}
          operationalState={currentEdfaData?.[EDFA_PARAMS.OperationalState]}
          measuredGain={currentEdfaData?.[EDFA_PARAMS.MeasuredGain]}
          backReflectionPower={currentEdfaData?.[EDFA_PARAMS.BackReflectionPower]}
          opticalReturnLoss={currentEdfaData?.[EDFA_PARAMS.OpticalReturnLoss]}
          alsDisabledSecondsRemaining={currentEdfaData?.[EDFA_PARAMS.AlsDisabledSecondsRemaining]}
          edfaType={EDFA_TYPE.Booster}
          monitoredData={monitoredData}
        />
      </Box>
    </Layout>
  );
}
export default Booster;
