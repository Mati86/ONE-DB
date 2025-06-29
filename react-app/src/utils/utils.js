import { toast } from 'react-hot-toast';
import {
  API_OPERATIONS,
  COMPONENTS,
  DEMUX_OPTICAL_PORT_NUMBERS,
  EDFA_TYPE,
  MUX_OPTICAL_PORT_NUMBERS,
  PORT_TYPE,
} from './data';
import { cleanupDeviceData as cleanupDeviceDataAPI } from './api';

// Custom event for device changes
const DEVICE_CHANGE_EVENT = 'deviceChange';

export function dispatchDeviceChangeEvent(deviceId) {
  const event = new CustomEvent(DEVICE_CHANGE_EVENT, { 
    detail: { deviceId } 
  });
  window.dispatchEvent(event);
}

export function getEdfaApiQuery(edfaName) {
  return { edfa: { dn: getEdfaDn(edfaName) } };
}

function getEdfaDn(edfaName) {
  if (edfaName === EDFA_TYPE.Booster) return 'ne=1;chassis=1;card=1;edfa=1';
  if (edfaName === EDFA_TYPE.Preamplifier)
    return 'ne=1;chassis=1;card=1;edfa=2';
  throw new Error(`${edfaName} is not an edfa`);
}

export function getApiPayloadForDeviceData(dataParams, deviceId = null) {
  const currentDeviceId = deviceId || getCurrentDeviceId();
  const deviceCredentials = getDeviceCredentials(currentDeviceId);
  
  if (!deviceCredentials) {
    throw new Error('No device credentials found. Please configure device credentials first.');
  }
  
  return {
    device_credentials: deviceCredentials,
    data_params: Array.isArray(dataParams) ? dataParams : [dataParams],
    deviceId: currentDeviceId
  };
}

export function getReadApiPayloadForEdfa(edfaName, parameter, deviceId = null) {
  return getApiPayloadForDeviceData({
    component: COMPONENTS.Edfa,
    parameter,
    query: getEdfaApiQuery(edfaName),
    operation: API_OPERATIONS.Read,
  }, deviceId);
}

export function getConfigurationApiPayloadForEdfa(edfaName, parameter, value, deviceId = null) {
  return getApiPayloadForDeviceData({
    component: COMPONENTS.Edfa,
    parameter,
    value,
    query: getEdfaApiQuery(edfaName),
    operation: API_OPERATIONS.Config,
  }, deviceId);
}

export function getReadApiPayloadForPort(portNumber, parameter, deviceId = null) {
  return getApiPayloadForDeviceData(
    getDataParamsForPort(portNumber, parameter),
    deviceId
  );
}

export function getConfigurationApiPayloadForPort(
  portNumber,
  parameter,
  value,
  deviceId = null
) {
  return getApiPayloadForDeviceData({
    operation: API_OPERATIONS.Config,
    component: COMPONENTS.OpticalPort,
    parameter,
    query: {
      'physical-port': { dn: `ne=1;chassis=1;card=1;port=${portNumber}` },
    },
    value,
  }, deviceId);
}

export function getDataParamsForPort(portNumber, parameter) {
  return {
    component: COMPONENTS.OpticalPort,
    parameter,
    query: {
      'physical-port': { dn: `ne=1;chassis=1;card=1;port=${portNumber}` },
    },
    operation: API_OPERATIONS.Read,
  };
}

export function getDemuxPortsOfType(ports, portType) {
  let portTypeFiltered;
  if (portType === 'all') portTypeFiltered = ports;
  else if (portType === 'input') {
    portTypeFiltered = ports.filter(portNumber => portNumber.includes('51'));
  } else if (portType === 'output') {
    portTypeFiltered = ports.filter(portNumber => portNumber.includes('52'));
  }
  return portTypeFiltered;
}

export function getMuxPortsOfType(ports, portType) {
  let portTypeFiltered;
  if (portType === 'all') portTypeFiltered = ports;
  else if (portType === 'input') {
    portTypeFiltered = ports.filter(portNumber => portNumber.includes('41'));
  } else if (portType === 'output') {
    portTypeFiltered = ports.filter(portNumber => portNumber.includes('42'));
  }
  return portTypeFiltered;
}

export function notifySuccess(message) {
  toast.success(message);
}

export function getPortType(portNumber) {
  if (MUX_OPTICAL_PORT_NUMBERS.includes(portNumber))
    return PORT_TYPE.Multiplexer;
  if (DEMUX_OPTICAL_PORT_NUMBERS.includes(portNumber))
    return PORT_TYPE.Demultiplexer;
}

export function pickKeys(obj, keysToPick) {
  const newObject = {};
  Object.keys(obj).forEach(
    key => keysToPick.includes(key) && (newObject[key] = obj[key])
  );
  return newObject;
}

export function getDeviceCredentials(deviceId = null) {
  if (deviceId) {
    const devices = getDevices();
    const device = devices.find(d => d.id === deviceId);
    return device ? device.credentials : undefined;
  }
  
  // Fallback to current device or first device
  const currentDeviceId = getCurrentDeviceId();
  if (currentDeviceId) {
    const devices = getDevices();
    const device = devices.find(d => d.id === currentDeviceId);
    if (device) return device.credentials;
  }
  
  // Legacy fallback
  const deviceCredentials = localStorage.getItem('deviceCredentials');
  return deviceCredentials ? JSON.parse(deviceCredentials) : undefined;
}

export function getDevices() {
  const devices = localStorage.getItem('devices');
  return devices ? JSON.parse(devices) : [];
}

export function saveDevices(devices) {
  localStorage.setItem('devices', JSON.stringify(devices));
}

export function getCurrentDeviceId() {
  return localStorage.getItem('currentDeviceId');
}

export function setCurrentDeviceId(deviceId) {
  localStorage.setItem('currentDeviceId', deviceId);
  // Dispatch device change event
  dispatchDeviceChangeEvent(deviceId);
}

export function addDevice(device) {
  const devices = getDevices();
  devices.push(device);
  saveDevices(devices);
}

export function updateDevice(deviceId, updatedDevice) {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index !== -1) {
    devices[index] = { ...devices[index], ...updatedDevice };
    saveDevices(devices);
  }
}

export function deleteDevice(deviceId) {
  const devices = getDevices();
  const filtered = devices.filter(d => d.id !== deviceId);
  saveDevices(filtered);
  
  // If deleted device was current, clear current device
  if (getCurrentDeviceId() === deviceId) {
    localStorage.removeItem('currentDeviceId');
    dispatchDeviceChangeEvent(null);
  }
  
  // Clean up device data on backend
  cleanupDeviceDataAPI(deviceId).catch(error => {
    console.warn('Failed to cleanup device data on backend:', error);
  });
}
