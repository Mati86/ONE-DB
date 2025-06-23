import React, { useEffect, useState } from 'react';
import useApiPoll from '../../../hooks/useApiPoll';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import { getReadApiPayloadForEdfa } from '../../../utils/utils';
import Chart from '../chart/Chart';

const apiPayload = getReadApiPayloadForEdfa(EDFA_TYPE.Booster, [
  EDFA_PARAMS.InputPower,
  EDFA_PARAMS.OutputPower,
]);

function BoosterChart() {
  const [monitoredData, setMonitoredData] = useState([]);
  const pollInterval = useDataPollInterval();

  const data = useApiPoll(pollInterval, apiPayload);

  useEffect(() => {
    if (data) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: 0,
          ...data.data,
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
    />
  );
}

export default BoosterChart;
