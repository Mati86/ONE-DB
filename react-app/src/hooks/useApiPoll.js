import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiRequestSender } from '../utils/api';
import { DEVICE_DATA_URL } from '../utils/data';

function useApiPoll(interval, requestData) {
  const [data, setData] = useState();

  useEffect(() => {
    if (!interval) return;
    const intervalId = setInterval(getData, interval);
    return () => clearInterval(intervalId);

    async function getData() {
      try {
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

  return data;
}

export default useApiPoll;
