import { useMemo } from 'react';

// This will return the data refresh onterval in milliseconds
function useDataPollInterval() {
  const pollInterval = useMemo(
    () => localStorage.getItem('dataRefreshInterval') || 3000,
    []
  );

  return pollInterval;
}

export default useDataPollInterval;
