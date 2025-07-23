import React, { useEffect, useState, useMemo } from 'react';
import useApiPoll from '../../../hooks/useApiPoll';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import { getReadApiPayloadForEdfa, getCurrentDeviceId } from '../../../utils/utils';
import Chart from '../chart/Chart';

function BoosterChart() {
  const [monitoredData, setMonitoredData] = useState([]);
  const pollInterval = useDataPollInterval();
  const currentDeviceId = getCurrentDeviceId();

  const apiPayload = useMemo(() => {
    if (!currentDeviceId) return null;
    return getReadApiPayloadForEdfa(EDFA_TYPE.Booster, [
      EDFA_PARAMS.InputPower,
      EDFA_PARAMS.OutputPower,
    ], currentDeviceId);
  }, [currentDeviceId]);

  const data = useApiPoll(pollInterval, apiPayload);

  useEffect(() => {
    if (data && data[0]) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: 0,
          ...data[0].data,
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
    <Chart
      title='Booster Power'
      data={monitoredData ?? []}
      aspect={2 / 1}
      XInterval={pollInterval / 1000}
      dataKeys={[
        { name: EDFA_PARAMS.InputPower, color: 'green' },
        { name: EDFA_PARAMS.OutputPower, color: '#8884d8' },
      ]}
    />
  );
}

export default BoosterChart;
