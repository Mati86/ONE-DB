import { toast } from 'react-hot-toast';
import {
  API_OPERATIONS,
  COMPONENTS,
  DEMUX_OPTICAL_PORT_NUMBERS,
  EDFA_TYPE,
  MUX_OPTICAL_PORT_NUMBERS,
  PORT_TYPE,
} from './data';

export function getEdfaApiQuery(edfaName) {
  return { edfa: { dn: getEdfaDn(edfaName) } };
}

function getEdfaDn(edfaName) {
  if (edfaName === EDFA_TYPE.Booster) return 'ne=1;chassis=1;card=1;edfa=1';
  if (edfaName === EDFA_TYPE.Preamplifier)
    return 'ne=1;chassis=1;card=1;edfa=2';
  throw new Error(`${edfaName} is not an edfa`);
}

export function getApiPayloadForDeviceData(dataParams) {
  return {
    device_credentials: getDeviceCredentials(),
    data_params: dataParams,
  };
}

export function getReadApiPayloadForEdfa(edfaName, parameter) {
  return getApiPayloadForDeviceData({
    component: COMPONENTS.Edfa,
    parameter,
    query: getEdfaApiQuery(edfaName),
    operation: API_OPERATIONS.Read,
  });
}

export function getConfigurationApiPayloadForEdfa(edfaName, parameter, value) {
  return getApiPayloadForDeviceData({
    component: COMPONENTS.Edfa,
    parameter,
    value,
    query: getEdfaApiQuery(edfaName),
    operation: API_OPERATIONS.Config,
  });
}

export function getReadApiPayloadForPort(portNumber, parameter) {
  return getApiPayloadForDeviceData(
    getDataParamsForPort(portNumber, parameter)
  );
}

export function getConfigurationApiPayloadForPort(
  portNumber,
  parameter,
  value
) {
  return getApiPayloadForDeviceData({
    operation: API_OPERATIONS.Config,
    component: COMPONENTS.OpticalPort,
    parameter,
    query: {
      'physical-port': { dn: `ne=1;chassis=1;card=1;port=${portNumber}` },
    },
    value,
  });
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

export function getDeviceCredentials() {
  const deviceCredentials = localStorage.getItem('deviceCredentials');
  return deviceCredentials ? JSON.parse(deviceCredentials) : undefined;
}
