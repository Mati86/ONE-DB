import os
import shutil

from ..settings import BASE_DIR

YANG_MODULES_DIR = os.path.join(BASE_DIR, 'data', 'generated_yang_modules')
XML_SKELETONS_DIR = os.path.join(BASE_DIR, 'data', 'generated_xml_skeletons')

# This directory is only for testing
DEVICE_SCHEMA_RESPONSES_DIR = os.path.join(
    BASE_DIR, 'data', 'test', 'device_schema_responses')

ERROR_MESSAGES = {
    "ServerError": "A server errror occurred"
}

# EDFA Parameters
EDFA_PARAMS = {
    # State Params
    'InputPower': 'input-power',
    'OutputPower': 'output-power',
    'EntityDescription': 'entity-description',
    'OperationalState': 'operational-state',
    'MeasuredGain': 'measured-gain',
    'BackReflectionPower': 'back-reflection-power',
    'OpticalReturnLoss': 'optical-return-loss',
    'AlsDisabledSecondsRemaining': 'als-disabled-seconds-remaining',

    # Config Params
    'CustomName': 'custom-name',
    'MaintenanceState': 'maintenance-state',
    'ControlMode': 'control-mode',
    'GainSwitchMode': 'gain-switch-mode',
    'TargetGain': 'target-gain',
    'TargetPower': 'target-power',
    'TargetGainTilt': 'target-gain-tilt',
    'LosShutdown': 'los-shutdown',
    'ForceApr': 'force-apr',
    'OpticalLooThreshold': 'optical-loo-threshold',
    'OpticalLooHysteresis': 'optical-loo-hysteresis',
    'OpticalReturnLossThreshold': 'optical-return-loss-threshold',
    'OpticalReturnLossHysteresis': 'optical-return-loss-hysteresis',
    'InputOverloadThreshold': 'input-overload-threshold',
    'InputOverloadHysteresis': 'input-overload-hysteresis',
    'InputLowDegradeThreshold': 'input-low-degrade-threshold',
    'InputLowDegradeHysteresis': 'input-low-degrade-hysteresis',
    'OpticalLosThreshold': 'optical-los-threshold',
    'OpticalLosHysteresis': 'optical-los-hysteresis',
    'OrlThresholdWarningThreshold': 'orl-threshold-warning-threshold',
    'OrlThresholdWarningHysteresis': 'orl-threshold-warning-hysteresis',
}

# Optical Port Parameters
OPTICAL_PORT_PARAMS = {
    # State Params
    'EntityDescription': 'entity-description',
    'OperationalState': 'operational-state',
    'InputPower': 'input-power',
    'OutputPower': 'output-power',
    # Config Params
    'CustomName': 'custom-name',
    'MaintenanceState': 'maintenance-state',
    'InputLowDegradeThreshold': 'input-low-degrade-threshold',
    'InputLowDegradeHysteresis': 'input-low-degrade-hysteresis',
    'OpticalLosThreshold': 'optical-los-threshold',
    'OpticalLosHysteresis': 'optical-los-hysteresis',
}

# Port Numbers
MUX_OPTICAL_PORT_NUMBERS = [
    '4101', '4102', '4103', '4104', '4105', '4106', '4107', '4108', '4109', '4110',
    '4111', '4112', '4113', '4114', '4115', '4116', '4117', '4118', '4119', '4120',
]

DEMUX_OPTICAL_PORT_NUMBERS = [
    '5201', '5202', '5203', '5204', '5205', '5206', '5207', '5208', '5209', '5210',
    '5211', '5212', '5213', '5214', '5215', '5216', '5217', '5218', '5219', '5220',
]

def ensure_base_directories_exist():
    """Ensure all base directories exist"""
    os.makedirs(YANG_MODULES_DIR, exist_ok=True)
    os.makedirs(XML_SKELETONS_DIR, exist_ok=True)
    os.makedirs(DEVICE_SCHEMA_RESPONSES_DIR, exist_ok=True)

def get_device_yang_modules_dir(device_id=None):
    """Get device-specific YANG modules directory"""
    ensure_base_directories_exist()
    if device_id:
        device_dir = os.path.join(YANG_MODULES_DIR, f'device_{device_id}')
        os.makedirs(device_dir, exist_ok=True)
        return device_dir
    return YANG_MODULES_DIR

def get_device_xml_skeletons_dir(device_id=None):
    """Get device-specific XML skeletons directory"""
    ensure_base_directories_exist()
    if device_id:
        device_dir = os.path.join(XML_SKELETONS_DIR, f'device_{device_id}')
        os.makedirs(device_dir, exist_ok=True)
        return device_dir
    return XML_SKELETONS_DIR

def cleanup_device_data(device_id):
    """
    Clean up device-specific data when a device is deleted
    
    Args:
        device_id (str): The device ID to clean up
    """
    if not device_id:
        return
    
    try:
        # Clean up device-specific YANG modules directory
        device_yang_dir = get_device_yang_modules_dir(device_id)
        if os.path.exists(device_yang_dir):
            shutil.rmtree(device_yang_dir)
            print(f"Cleaned up YANG modules directory for device {device_id}")
        
        # Clean up device-specific XML skeletons directory
        device_xml_dir = get_device_xml_skeletons_dir(device_id)
        if os.path.exists(device_xml_dir):
            shutil.rmtree(device_xml_dir)
            print(f"Cleaned up XML skeletons directory for device {device_id}")
            
    except Exception as e:
        print(f"Error cleaning up device data for {device_id}: {str(e)}")

def ensure_device_directories_exist(device_id=None):
    """
    Ensure device-specific directories exist
    
    Args:
        device_id (str, optional): Device ID to create directories for
    """
    if device_id:
        get_device_yang_modules_dir(device_id)
        get_device_xml_skeletons_dir(device_id)
    else:
        ensure_base_directories_exist()

sample_rpc_reply_edfa = '''
<rpc-reply xmlns="urn:ietf:params:xml:ns:netconf:base:1.0" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" message-id="101">
  <data>
    <edfas xmlns="http://www.lumentum.com/lumentum-ote-edfa" xmlns:lotep="http://www.lumentum.com/lumentum-ote-edfa">
      <edfa>
        <dn>ne=1;chassis=1;card=1;edfa=2</dn>
        <state>
          <lotep:entity-description>Preamplifier</lotep:entity-description>
          <lotep:operational-state>In service</lotep:operational-state>
          <lotep:input-power>8.0</lotep:input-power>
          <lotep:output-power>20.0</lotep:output-power>
          <lotep:measured-gain>8.0</lotep:measured-gain>
          <lotep:back-reflection-power>8.0</lotep:back-reflection-power>
          <lotep:optical-return-loss>8.0</lotep:optical-return-loss>
          <lotep:als-disabled-seconds-remaining>8.0</lotep:als-disabled-seconds-remaining>
        </state>
        <config>
          <lotep:maintenance-state>out-of-service</lotep:maintenance-state>
          <lotep:custom-name>preamplifier</lotep:custom-name>
          <lotep:control-mode>constant-gain</lotep:control-mode>
          <lotep:gain-switch-mode>low-gain</lotep:gain-switch-mode>
          <lotep:target-gain>12</lotep:target-gain>
          <lotep:target-power>4</lotep:target-power>
          <lotep:target-gain-tilt>0</lotep:target-gain-tilt>
          <lotep:los-shutdown>on</lotep:los-shutdown>
          <lotep:optical-loo-threshold>2.0</lotep:optical-loo-threshold>
          <lotep:optical-loo-hysteresis>2.0</lotep:optical-loo-hysteresis>
          <lotep:optical-return-loss-threshold>0</lotep:optical-return-loss-threshold>
          <lotep:optical-return-loss-hysteresis>1</lotep:optical-return-loss-hysteresis>
          <lotep:input-overload-threshold>11</lotep:input-overload-threshold>
          <lotep:input-overload-hysteresis>0</lotep:input-overload-hysteresis>
          <lotep:input-low-degrade-threshold>-20</lotep:input-low-degrade-threshold>
          <lotep:input-low-degrade-hysteresis>-30</lotep:input-low-degrade-hysteresis>
          <lotep:optical-los-threshold>-10</lotep:optical-los-threshold>
          <lotep:optical-los-hysteresis>10</lotep:optical-los-hysteresis>
          <lotep:orl-threshold-warning-threshold />
          <lotep:orl-threshold-warning-hysteresis />
          <lotep:force-apr>on</lotep:force-apr>
        </config>
      </edfa>
    </edfas>
  </data>
</rpc-reply>
'''


sample_rpc_reply_optical_port = '''
<rpc-reply xmlns="urn:ietf:params:xml:ns:netconf:base:1.0" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" message-id="101">
  <data>
    <physical-ports xmlns="http://www.lumentum.com/lumentum-ote-port" xmlns:lotep="http://www.lumentum.com/lumentum-ote-port" xmlns:lotepopt="http://www.lumentum.com/lumentum-ote-port-optical"
    >
      <physical-port>
        <dn>ne=1;chassis=1;card=1;port=4102</dn>
        <state>
          <lotepopt:entity-description>Optical Port for Mux</lotepopt:entity-description>
          <lotepopt:operational-state>In service</lotepopt:operational-state>
          <lotepopt:input-power>8.0</lotepopt:input-power>
          <lotepopt:output-power>20.0</lotepopt:output-power>
          <lotepopt:outvoa-input-power-to-voa>8.0</lotepopt:outvoa-input-power-to-voa>
          <lotepopt:outvoa-actual-attenuation>20.0</lotepopt:outvoa-actual-attenuation>
          <lotepopt:back-reflection-power>8.0</lotepopt:back-reflection-power>
          <lotepopt:optical-return-loss>8.0</lotepopt:optical-return-loss>
        </state>
        <config>
          <lotep:maintenance-state>out-of-service</lotep:maintenance-state>
          <lotep:custom-name>preamplifier</lotep:custom-name>
          <lotep:input-low-degrade-threshold>-20.0</lotep:input-low-degrade-threshold>
          <lotep:input-low-degrade-hysteresis>5.0</lotep:input-low-degrade-hysteresis>
          <lotep:optical-los-threshold>-1.0</lotep:optical-los-threshold>
          <lotep:optical-los-hysteresis>2.0</lotep:optical-los-hysteresis>
          <lotep:optical-loo-threshold>-4.0</lotep:optical-loo-threshold>
          <lotep:optical-loo-hysteresis>5.0</lotep:optical-loo-hysteresis>
          <outvoa-target-attenuation>0</outvoa-target-attenuation>
          <optical-return-loss-threshold>0</optical-return-loss-threshold>
          <optical-return-loss-hysteresis>2.0</optical-return-loss-hysteresis>
        </config>
      </physical-port>
    </physical-ports>
  </data>
</rpc-reply>
'''

sample_rpc_reply = sample_rpc_reply_edfa

sample_rpc_reply_edit = '''
<rpc-reply xmlns="urn:ietf:params:xml:ns:netconf:base:1.0" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" message-id="101">
  <data>
    <ok />
  </data>
</rpc-reply>
'''




# All the scripts are run inside the djangobackend/data/yang_modules directory

# pyang commands to generate sample xml skeletons:

# 1) lumentum-ote-edfa:

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" - f sample-xml-skeleton - o ../components_xml/lumentum-ote-edfa.xml lumentum-ote-edfa.yang

# 2) lumentum-ote-port:

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" - f sample-xml-skeleton - o ../components_xml/lumentum-ote-port.xml lumentum-ote-port.yang

# 3) lumentum-ote-port-optical:

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" - f sample-xml-skeleton - o ../components_xml/lumentum-ote-port-optical.xml lumentum-ote-port.yang lumentum-ote-port-optical.yang

# 4) lumentum-ote-port-ethernet:

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" - f sample-xml-skeleton - o ../components_xml/lumentum-ote-port-ethernet.xml lumentum-ote-port.yang lumentum-ote-port-ethernet.yang

# 5) lumentum-ote-port-pluggable:
# (giving error)
# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" -f sample-xml-skeleton -o ../components_xml/lumentum-ote-port-pluggable.xml lumentum-ote-port.yang lumentum-ote-port-pluggable.yang


edfa_tree = '''
<data xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <edfas xmlns="http://www.lumentum.com/lumentum-ote-edfa">
    <edfa xmlns="http://www.lumentum.com/lumentum-ote-edfa">
      <dn xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
      <config xmlns="http://www.lumentum.com/lumentum-ote-edfa">
        <maintenance-state xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <custom-name xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <control-mode xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <gain-switch-mode xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <target-gain xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <target-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <target-gain-tilt xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <los-shutdown xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-loo-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-loo-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-return-loss-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-return-loss-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <input-overload-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <input-overload-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <input-low-degrade-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <input-low-degrade-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-los-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-los-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <orl-threshold-warning-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <orl-threshold-warning-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <force-apr xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
      </config>
      <state xmlns="http://www.lumentum.com/lumentum-ote-edfa">
        <entity-description xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <operational-state xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <output-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <input-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <measured-gain xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <back-reflection-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <optical-return-loss xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <als-disabled-seconds-remaining xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        <voas xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <voa xmlns="http://www.lumentum.com/lumentum-ote-edfa">
            <dn xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <voa-input-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <voa-output-power xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <voa-attentuation xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          </voa>
        </voas>
        <pumps xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <pump xmlns="http://www.lumentum.com/lumentum-ote-edfa">
            <dn xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <pump-current xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <pump-temperature xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <tec-current xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <tec-temperature xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          </pump>
        </pumps>
        <erbium-coils xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <erbium-coil xmlns="http://www.lumentum.com/lumentum-ote-edfa">
            <dn xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
            <erbium-temperature xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          </erbium-coil>
        </erbium-coils>
      </state>
    </edfa>
  </edfas>
  <edfas-metadata xmlns="http://www.lumentum.com/lumentum-ote-edfa">
    <edfa-metadata xmlns="http://www.lumentum.com/lumentum-ote-edfa">
      <dn xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
      <config xmlns="http://www.lumentum.com/lumentum-ote-edfa">
        <target-gain xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </target-gain>
        <target-gain-tilt xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </target-gain-tilt>
        <optical-loo-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </optical-loo-threshold>
        <optical-loo-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </optical-loo-hysteresis>
        <input-overload-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </input-overload-threshold>
        <input-overload-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </input-overload-hysteresis>
        <input-low-degrade-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </input-low-degrade-threshold>
        <input-low-degrade-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </input-low-degrade-hysteresis>
        <optical-los-threshold xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </optical-los-threshold>
        <optical-los-hysteresis xmlns="http://www.lumentum.com/lumentum-ote-edfa">
          <minimum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <maximum xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
          <default xmlns="http://www.lumentum.com/lumentum-ote-edfa"/>
        </optical-los-hysteresis>
      </config>
    </edfa-metadata>
  </edfas-metadata>
</data>
'''
