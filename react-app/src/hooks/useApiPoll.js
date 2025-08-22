import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getRedisMonitoringData } from '../utils/api'; // use Redis instead of DEVICE_DATA_URL
import { getCurrentDeviceId } from '../utils/utils';

function useApiPoll(interval, requestData) {
  const [data, setData] = useState();

  useEffect(() => {
    if (!interval || !requestData) return;

    const currentDeviceId = getCurrentDeviceId();
    if (!currentDeviceId) {
      console.warn('No device selected. Redis polling paused.');
      setData(null);
      return;
    }

    const intervalId = setInterval(getData, interval);
    getData(); // Initial call
    return () => clearInterval(intervalId);

    async function getData() {
      try {
        const deviceId = getCurrentDeviceId();
        if (!deviceId) {
          setData(null);
          return;
        }

        // requestData is an array of { component, parameter, key }
        const results = await Promise.all(
          requestData.map(({ component, parameter, key }) =>
            getRedisMonitoringData(deviceId, component, parameter)
              .then(res => ({
  key,
  data: { 
    [parameter]: res?.data?.value ?? null, 
    timestamp: res?.data?.timestamp ?? null 
  }
}))

              .catch(err => ({
                key,
                error: { message: err.message }
              }))
          )
        );

        setData(results);
      } catch (e) {
        toast.error(e.message, { id: 'poll-error' });
      }
    }
  }, [interval, requestData]);

  useEffect(() => {
    const handleDeviceChange = (event) => {
      const { deviceId } = event.detail;
      if (!deviceId) {
        setData(null);
      } else {
        console.log('Device changed, Redis poll will refresh on next interval');
      }
    };

    window.addEventListener('deviceChange', handleDeviceChange);
    return () => window.removeEventListener('deviceChange', handleDeviceChange);
  }, []);

  return data;
}

export default useApiPoll;
