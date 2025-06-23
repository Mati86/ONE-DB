from lxml import etree
from ncclient import manager

from .common import clean_xml_from_namespaces
from .data import sample_rpc_reply_edit
from .generate_ncclient_config_payload import generate_ncclient_config_payload


def edit_data(device_credentials, component, target_parameter, value, query):
    netconf_config = generate_ncclient_config_payload(
        component, target_parameter, value, query)

    # Use test data
    # rpc_reply = sample_rpc_reply_edit
    # response_root = etree.fromstring(rpc_reply)
    # clean_xml_from_namespaces(response_root)
    # element = response_root.find(".//" + 'ok')

    with manager.connect(host=device_credentials['ip'], port=device_credentials['port'], username=device_credentials['username'], password=device_credentials['password'], hostkey_verify=False) as device_connection_manager:
        rpc_reply = device_connection_manager.edit_config(
            target="running", config=netconf_config)
        if rpc_reply.ok:
            print("edit_config operation successfull")
        else:
            print("edit_config operation failed!")
