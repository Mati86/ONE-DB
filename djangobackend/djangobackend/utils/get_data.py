from lxml import etree
from ncclient import manager

from .common import (clean_xml_from_namespaces, get_device_credentials_list,
                     print_dict)
from .data import sample_rpc_reply
from .generate_ncclient_filter_payload import generate_ncclient_filter_payload


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


def get_data(device_credentials, component, target_parameter, query):
    target_parameters = get_parameters_array(target_parameter)
    result = get_target_params_dict(target_parameters)

    # Use data from device using filter
    netconf_filter = generate_ncclient_filter_payload(
        component, target_parameters, query)

    with manager.connect(host=device_credentials['ip'], port=device_credentials['port'], username=device_credentials['username'], password=device_credentials['password'], hostkey_verify=False) as device_connection_manager:
        rpc_reply = device_connection_manager.get(filter=netconf_filter)
        rpc_reply_xml = rpc_reply.xml

        # Use test data
        # rpc_reply_xml = sample_rpc_reply

        response_root = etree.fromstring(
            bytes(rpc_reply_xml, encoding='utf8'))
        clean_xml_from_namespaces(response_root)

    for parameter in target_parameters:
        element = response_root.find(".//" + parameter)
        result[parameter] = element.text
    # except:
    #     print("error for parameter:", parameter, query)
    # return {"success": False}
    return result
