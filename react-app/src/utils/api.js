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
  const response = await fetch(url, options);
  if (response.status >= 500) {
    throw new Error(
      response.error?.message ?? `Request to api failed due to a server error.`
    );
  }
  const data = await response.json();
  return data;
}
