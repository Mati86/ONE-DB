import React, { useEffect, useState, useMemo } from 'react';
import { getRedisMonitoringData } from '../../../utils/api';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import { EDFA_PARAMS, EDFA_TYPE } from '../../../utils/data';
import { getCurrentDeviceId } from '../../../utils/utils';
import Chart from '../chart/Chart';

function BoosterChart() {
  const [monitoredData, setMonitoredData] = useState([]);
  const pollInterval = useDataPollInterval();
  const currentDeviceId = getCurrentDeviceId();

  const YAxisDomain = useMemo(() => {
    if (monitoredData.length === 0) return [-60, 20]; // Default values if no data

    const allValues = monitoredData.flatMap(item => [
      parseFloat(item[EDFA_PARAMS.InputPower]),
      parseFloat(item[EDFA_PARAMS.OutputPower]),
    ]).filter(val => !isNaN(val));

    if (allValues.length === 0) return [-60, 20];

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    // Add some padding to the domain
    const padding = (maxVal - minVal) * 0.1 || 1;
    return [minVal - padding, maxVal + padding];
  }, [monitoredData]);

  useEffect(() => {
    let intervalId;
    if (pollInterval && currentDeviceId) {
      const pollData = async () => {
        const inputPowerData = await getRedisMonitoringData(
          currentDeviceId,
          `edfa-${EDFA_TYPE.Booster}`,
          EDFA_PARAMS.InputPower
        );
        const outputPowerData = await getRedisMonitoringData(
          currentDeviceId,
          `edfa-${EDFA_TYPE.Booster}`,
          EDFA_PARAMS.OutputPower
        );

        if (inputPowerData?.data?.value !== undefined && outputPowerData?.data?.value !== undefined) {
          setMonitoredData(prev => {
            const newData = [...prev];
            newData.unshift({
              name: newData.length,
              [EDFA_PARAMS.InputPower]: parseFloat(inputPowerData.data.value),
              [EDFA_PARAMS.OutputPower]: parseFloat(outputPowerData.data.value),
            });
            return newData.slice(0, 7).map((data, index) => ({
              ...data,
              name: index * (pollInterval / 1000),
            }));
          });
        }
      };

      pollData(); // Initial fetch
      intervalId = setInterval(pollData, pollInterval);
    }

    return () => clearInterval(intervalId);
  }, [pollInterval, currentDeviceId]);

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
      YAxisDomain={YAxisDomain}
    />
  );
}

export default BoosterChart;
