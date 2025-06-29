import os

from lxml import etree
from ncclient import manager

from ..settings import BASE_DIR
from .common import get_schema_rpc_reply, has_key, validate_device_credentials
from .data import get_device_yang_modules_dir, get_device_xml_skeletons_dir
from .yang_to_xml_skeleton import yang_to_xml_skeleton
from .device_connection_manager import get_device_connection


def generate_yang_schemas(schemas, credentials, device_id=None):
    # Validate device credentials
    if not validate_device_credentials(credentials):
        raise ValueError("Invalid device credentials")
    
    # Get device-specific directories
    yang_modules_dir = get_device_yang_modules_dir(device_id)
    xml_skeletons_dir = get_device_xml_skeletons_dir(device_id)

    # Use dynamic device connection
    device_connection_manager = get_device_connection(credentials)
    
    try:
        # generate yang files
        for schema in schemas:
            # Use data from device using filter
            reply = device_connection_manager.get_schema(schema["name"])

            # convert xml string to xml tree
            xml_reply_root = etree.fromstring(
                bytes(reply.xml, encoding='utf8'))

            # Use test data
            # sample_schema_rpc_reply = get_schema_rpc_reply(schema['name'])

            # # convert xml string to xml tree
            # xml_reply_root = etree.fromstring(
            #     bytes(sample_schema_rpc_reply, encoding='utf8'))

            yang_module = xml_reply_root.find(
                './/{urn:ietf:params:xml:ns:yang:ietf-netconf-monitoring}data').text

            YANG_FILE_PATH = os.path.join(
                yang_modules_dir, schema["name"] + ".yang")
            XML_SKELETON_FILE_PATH = os.path.join(
                xml_skeletons_dir, schema["name"] + ".xml")

            with open(YANG_FILE_PATH, "w") as f:
                # Write the contents of the module to the file
                f.write(yang_module)

        # generate xml skeletons
        for schema in schemas:
            YANG_FILE_PATH = os.path.join(
                yang_modules_dir, schema["name"] + ".yang")
            XML_SKELETON_FILE_PATH = os.path.join(
                xml_skeletons_dir, schema["name"] + ".xml")

            yang_to_xml_skeleton(YANG_FILE_PATH, XML_SKELETON_FILE_PATH, device_id=device_id)
            
    except Exception as e:
        raise Exception(f"Failed to generate YANG schemas: {str(e)}")
    finally:
        # Ensure connection is closed
        if device_connection_manager:
            device_connection_manager.close_session()
