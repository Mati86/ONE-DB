from lxml import etree
from ncclient import manager

from .common import clean_xml_from_namespaces, validate_device_credentials
from .data import sample_rpc_reply_edit
from .generate_ncclient_config_payload import generate_ncclient_config_payload
from .device_connection_manager import get_device_connection


def edit_data(device_credentials, component, target_parameter, value, query, device_id=None):
    # Validate device credentials
    if not validate_device_credentials(device_credentials):
        raise ValueError("Invalid device credentials")
    
    netconf_config = generate_ncclient_config_payload(
        component, target_parameter, value, query, device_id)

    # Use test data
    # rpc_reply = sample_rpc_reply_edit
    # response_root = etree.fromstring(rpc_reply)
    # clean_xml_from_namespaces(response_root)
    # element = response_root.find(".//" + 'ok')

    # Use dynamic device connection
    device_connection_manager = get_device_connection(device_credentials)
    
    try:
        rpc_reply = device_connection_manager.edit_config(
            target="running", config=netconf_config)
        if rpc_reply.ok:
            print("edit_config operation successful")
        else:
            raise Exception("edit_config operation failed!")
    except Exception as e:
        raise Exception(f"Failed to edit device configuration: {str(e)}")
    finally:
        # Ensure connection is closed
        if device_connection_manager:
            device_connection_manager.close_session()
