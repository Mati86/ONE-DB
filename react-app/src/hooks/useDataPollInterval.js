import { useEffect, useState } from 'react';
import { getCurrentDeviceId, getDevices } from '../utils/utils';

// This will return the data refresh interval in milliseconds
function useDataPollInterval() {
  const [pollInterval, setPollInterval] = useState(() => {
    const currentDeviceId = getCurrentDeviceId();
    if (currentDeviceId) {
      const devices = getDevices();
      const currentDevice = devices.find(device => device.id === currentDeviceId);
      if (currentDevice && currentDevice.dataRefreshInterval) {
        return currentDevice.dataRefreshInterval * 1000; // Convert to milliseconds
      }
    }
    // Fallback to global setting or default
    return parseInt(localStorage.getItem('dataRefreshInterval') || '3000');
  });

  useEffect(() => {
    const handleDeviceChange = () => {
      const currentDeviceId = getCurrentDeviceId();
      if (currentDeviceId) {
        const devices = getDevices();
        const currentDevice = devices.find(device => device.id === currentDeviceId);
        if (currentDevice && currentDevice.dataRefreshInterval) {
          setPollInterval(currentDevice.dataRefreshInterval * 1000);
        } else {
          setPollInterval(3000); // Default fallback
        }
      } else {
        setPollInterval(3000); // Default when no device selected
      }
    };

    // Listen for device changes
    window.addEventListener('deviceChange', handleDeviceChange);
    
    // Also listen for storage changes (when devices are updated)
    const handleStorageChange = (e) => {
      if (e.key === 'devices') {
        handleDeviceChange();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('deviceChange', handleDeviceChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return pollInterval;
}

export default useDataPollInterval;
