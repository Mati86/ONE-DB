import {
  DEVICE_DATA_URL,
  DEVICE_SCHEMAS_URL,
  DEVICE_SCHEMA_DEPENDENCIES_URL,
  DEVICE_CLEANUP_URL,
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
