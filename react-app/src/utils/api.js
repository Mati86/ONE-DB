import {
  DEVICE_DATA_URL,
  DEVICE_SCHEMAS_URL,
  DEVICE_SCHEMA_DEPENDENCIES_URL,
  DEVICE_CLEANUP_URL,
  REDIS_MONITORING_URL,
  REDIS_RUNNING_CONFIG_URL,
  REDIS_OPERATIONAL_CONFIG_URL,
  REDIS_DEVICE_STATUS_URL,
  REDIS_DEVICE_SUMMARY_URL,
 
} from './data';

export async function configureDeviceData(requestData) {
  return await apiRequestSender(DEVICE_DATA_URL, {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function readDeviceData(requestData) {
  return await apiRequestSender(DEVICE_DATA_URL, {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function saveYangModules(requestData) {
  return await apiRequestSender(DEVICE_SCHEMAS_URL, {
    method: 'PUT',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function saveYangModuleDependencies(requestData) {
  return await apiRequestSender(DEVICE_SCHEMA_DEPENDENCIES_URL, {
    method: 'PUT',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function cleanupDeviceData(deviceId) {
  return await apiRequestSender(DEVICE_CLEANUP_URL, {
    method: 'DELETE',
    body: JSON.stringify({ deviceId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Redis API functions
export async function getRedisMonitoringData(deviceId, component, parameter) {
  // Special handling for grouped optical port data
  const url = `${REDIS_MONITORING_URL}?deviceId=${deviceId}&component=${component}&parameter=${parameter}`;
  return await apiRequestSender(url, { method: 'GET' });
}
 



export async function getRedisRunningConfig(deviceId, component, parameter) {
  const url = `${REDIS_RUNNING_CONFIG_URL}?deviceId=${deviceId}&component=${component}&parameter=${parameter}`;
  return await apiRequestSender(url, { method: 'GET' });
}

export async function getRedisOperationalConfig(deviceId, component, parameter) {
  const url = `${REDIS_OPERATIONAL_CONFIG_URL}?deviceId=${deviceId}&component=${component}&parameter=${parameter}`;
  return await apiRequestSender(url, { method: 'GET' });
}

export async function getRedisDeviceStatus(deviceId) {
  const url = `${REDIS_DEVICE_STATUS_URL}?deviceId=${deviceId}`;
  return await apiRequestSender(url, { method: 'GET' });
}

export async function getRedisDeviceSummary(deviceId) {
  const url = `${REDIS_DEVICE_SUMMARY_URL}?deviceId=${deviceId}`;
  return await apiRequestSender(url, { method: 'GET' });
}

// New function to get running configuration for multiple parameters
export async function getRedisRunningConfigBatch(deviceId, component, parameters) {
  const promises = parameters.map(parameter => 
    getRedisRunningConfig(deviceId, component, parameter)
  );
  
  try {
    const results = await Promise.all(promises);
    const configData = {};
    
    parameters.forEach((parameter, index) => {
      const result = results[index];
      if (result && result.data && result.data.value !== undefined) {
        configData[parameter] = result.data.value;
      }
    });
    
    return { data: configData };
  } catch (error) {
    console.error('Error fetching running config batch:', error);
    return { data: {} };
  }
}



export async function apiRequestSender(url, options) {
  try {
    const response = await fetch(url, options);

    // Log raw response text before attempting to parse JSON
    const responseText = await response.text();
    console.log(`API Request Debug: Raw response for URL: ${url}`, responseText);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(`API Request Error: Could not parse JSON from error response for URL: ${url}`, jsonError, `Raw response: ${responseText}`);
        throw new Error(`Request to API failed with status ${response.status}: ${response.statusText}. Could not parse error details.`);
      }
      console.error(`API Request Error: Status ${response.status} for URL: ${url}`, errorData);
      throw new Error(
        errorData.error?.message || `Request to API failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = JSON.parse(responseText);
    console.log(`API Request Debug: Parsed data for URL: ${url}`, data);
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`Network Error: Failed to fetch from URL: ${url}. This might indicate a CORS issue or backend not running.`, error);
      throw new Error(`Network Error: Unable to connect to the server. Please check if the backend is running and accessible. (${error.message})`);
    } else {
      console.error(`API Request Error for URL: ${url}`, error);
      throw error;
    }
  }
}
