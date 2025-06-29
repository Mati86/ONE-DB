from lxml import etree
from ncclient import manager

from .common import (clean_xml_from_namespaces, get_device_credentials_list,
                     print_dict, validate_device_credentials)
from .data import sample_rpc_reply
from .generate_ncclient_filter_payload import generate_ncclient_filter_payload
from .device_connection_manager import get_device_connection


def get_parameters_array(target_parameter):
    if type(target_parameter) == list:
        return target_parameter
    if type(target_parameter) == str:
        return [target_parameter]


def get_target_params_dict(target_parameters):
    result = {}
    for parameter in target_parameters:
        result[parameter] = ""
    return result


def get_data(device_credentials, component, target_parameter, query, device_id=None):
    # Validate device credentials
    if not validate_device_credentials(device_credentials):
        raise ValueError("Invalid device credentials")
    
    target_parameters = get_parameters_array(target_parameter)
    result = get_target_params_dict(target_parameters)

    # Use data from device using filter
    netconf_filter = generate_ncclient_filter_payload(
        component, target_parameters, query, device_id)

    # Use dynamic device connection
    device_connection_manager = get_device_connection(device_credentials)
    
    try:
        rpc_reply = device_connection_manager.get(filter=netconf_filter)
        rpc_reply_xml = rpc_reply.xml

        # Use test data
        # rpc_reply_xml = sample_rpc_reply

        response_root = etree.fromstring(
            bytes(rpc_reply_xml, encoding='utf8'))
        clean_xml_from_namespaces(response_root)

        for parameter in target_parameters:
            element = response_root.find(".//" + parameter)
            if element is not None:
                result[parameter] = element.text
            else:
                result[parameter] = None
                
    except Exception as e:
        raise Exception(f"Failed to retrieve data from device: {str(e)}")
    finally:
        # Ensure connection is closed
        if device_connection_manager:
            device_connection_manager.close_session()
    
    return result
