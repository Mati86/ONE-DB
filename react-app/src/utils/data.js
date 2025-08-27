export const DEVICE_DATA_URL = 'http://localhost:8000/api/data';
export const DEVICE_SCHEMAS_URL = 'http://localhost:8000/api/device_schemas';
export const DEVICE_SCHEMA_DEPENDENCIES_URL =
  'http://localhost:8000/api/device_schema_dependencies';
export const DEVICE_CLEANUP_URL = 'http://localhost:8000/api/device_cleanup';

// Redis API endpoints
export const REDIS_MONITORING_URL = 'http://localhost:8000/api/redis/monitoring';
export const REDIS_RUNNING_CONFIG_URL = 'http://localhost:8000/api/redis/running_config';
export const REDIS_OPERATIONAL_CONFIG_URL = 'http://localhost:8000/api/redis/operational_config';
export const REDIS_DEVICE_STATUS_URL = 'http://localhost:8000/api/redis/device_status';
export const REDIS_DEVICE_SUMMARY_URL = 'http://localhost:8000/api/redis/device_summary';


export const API_OPERATIONS = {
  Config: 'config',
  Read: 'read',
};

export const EDFA_TYPE = {
  Preamplifier: 'preamplifier',
  Booster: 'booster',
};

export const PORT_TYPE = {
  Multiplexer: 'multiplexer',
  Demultiplexer: 'Demultiplexer',
};

export const EDFA_PARAMS = {
  // State Params
  InputPower: 'input-power',
  OutputPower: 'output-power',
  EntityDescription: 'entity-description',
  OperationalState: 'operational-state',
  MeasuredGain: 'measured-gain',
  BackReflectionPower: 'back-reflection-power',
  OpticalReturnLoss: 'optical-return-loss',
  AlsDisabledSecondsRemaining: 'als-disabled-seconds-remaining',

  // Config Params
  CustomName: 'custom-name',
  MaintenanceState: 'maintenance-state',
  ControlMode: 'control-mode',
  GainSwitchMode: 'gain-switch-mode',
  TargetGain: 'target-gain',
  TargetPower: 'target-power',
  TargetGainTilt: 'target-gain-tilt',
  LosShutdown: 'los-shutdown',
  ForceApr: 'force-apr',
  OpticalLooThreshold: 'optical-loo-threshold',
  OpticalLooHysteresis: 'optical-loo-hysteresis',
  OpticalReturnLossThreshold: 'optical-return-loss-threshold',
  OpticalReturnLossHysteresis: 'optical-return-loss-hysteresis',
  InputOverloadThreshold: 'input-overload-threshold',
  InputOverloadHysteresis: 'input-overload-hysteresis',
  InputLowDegradeThreshold: 'input-low-degrade-threshold',
  InputLowDegradeHysteresis: 'input-low-degrade-hysteresis',
  OpticalLosThreshold: 'optical-los-threshold',
  OpticalLosHysteresis: 'optical-los-hysteresis',
  OrlThresholdWarningThreshold: 'orl-threshold-warning-threshold',
  OrlThresholdWarningHysteresis: 'orl-threshold-warning-hysteresis',
};

export const OPTICAL_PORT_PARAMS = {
  // State Params
  EntityDescription: 'entity-description',
  OperationalState: 'operational-state',
  InputPower: 'input-power',
  OutputPower: 'output-power',
  // OutVoaInputPowerToVoa: 'outvoa-input-power-to-voa',
  // OutVoaActualAttenuation: 'outvoa-actual-attenuation',
  // BackReflectionPower: 'back-reflection-power',
  // OpticalReturnLoss: 'optical-return-loss',
  // Config Params
  CustomName: 'custom-name',
  MaintenanceState: 'maintenance-state',
  InputLowDegradeThreshold: 'input-low-degrade-threshold',
  InputLowDegradeHysteresis: 'input-low-degrade-hysteresis',
  OpticalLosThreshold: 'optical-los-threshold',
  OpticalLosHysteresis: 'optical-los-hysteresis',
};

export const COMPONENTS = {
  Edfa: 'edfa',
  OpticalPort: 'optical-port',
};

export const MUX_OPTICAL_PORT_NUMBERS = [
  '4101',
  '4102',
  '4103',
  '4104',
  '4105',
  '4106',
  '4107',
  '4108',
  '4109',
  '4110',
  '4111',
  '4112',
  '4113',
  '4114',
  '4115',
  '4116',
  '4117',
  '4118',
  '4119',
  '4120',
];

export const DEMUX_OPTICAL_PORT_NUMBERS = [
  '5201',
  '5202',
  '5203',
  '5204',
  '5205',
  '5206',
  '5207',
  '5208',
  '5209',
  '5210',
  '5211',
  '5212',
  '5213',
  '5214',
  '5215',
  '5216',
  '5217',
  '5218',
  '5219',
  '5220',
];

export const EDFA_PLOTTABLE_PARAMETERS = new Set([
  EDFA_PARAMS.InputPower,
  EDFA_PARAMS.OutputPower,
  EDFA_PARAMS.MeasuredGain,
  EDFA_PARAMS.BackReflectionPower,
  EDFA_PARAMS.OpticalReturnLoss,
]);

export const OPTICAL_PORT_PLOTTABLE_PARAMETERS = new Set([
  OPTICAL_PORT_PARAMS.InputPower,
  OPTICAL_PORT_PARAMS.OutputPower,
]);
