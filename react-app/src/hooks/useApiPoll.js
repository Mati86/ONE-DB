import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiRequestSender } from '../utils/api';
import { DEVICE_DATA_URL } from '../utils/data';
import { getCurrentDeviceId } from '../utils/utils';

function useApiPoll(interval, requestData) {
  const [data, setData] = useState();

  useEffect(() => {
    if (!interval || !requestData) return;
    
    // Validate that we have a current device selected
    const currentDeviceId = getCurrentDeviceId();
    if (!currentDeviceId) {
      console.warn('No device selected. API polling paused.');
      setData(null); // Clear data when no device selected
      return;
    }
    
    const intervalId = setInterval(getData, interval);
    getData(); // Initial call
    return () => clearInterval(intervalId);

    async function getData() {
      try {
        // Double-check device is still selected before making API call
        if (!getCurrentDeviceId()) {
          setData(null);
          return;
        }
        
        const data = await apiRequestSender(DEVICE_DATA_URL, {
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setData(data);
      } catch (e) {
        toast.error(e.message, { id: 'poll-error' });
      }
    }
  }, [interval, requestData]);

  // Listen for device change events
  useEffect(() => {
    const handleDeviceChange = (event) => {
      const { deviceId } = event.detail;
      if (!deviceId) {
        // Device was deselected, clear data
        setData(null);
      } else {
        // Device was changed, data will be refreshed on next poll
        console.log('Device changed, will refresh data on next poll');
      }
    };

    window.addEventListener('deviceChange', handleDeviceChange);
    return () => window.removeEventListener('deviceChange', handleDeviceChange);
  }, []);

  return data;
}

export default useApiPoll;
