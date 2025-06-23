import os

from lxml import etree
from ncclient import manager

from ..settings import BASE_DIR
from .common import get_schema_rpc_reply, has_key
from .data import XML_SKELETONS_DIR, YANG_MODULES_DIR
from .yang_to_xml_skeleton import yang_to_xml_skeleton


def generate_yang_schemas(schemas, credentials):

    # generate yang files
    with manager.connect(host=credentials['ip'], port=credentials['port'], username=credentials['username'], password=credentials['password'], hostkey_verify=False) as m:
        for schema in schemas:

            # Use data from device using filter
            reply = m.get_schema(schema["name"])

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
                YANG_MODULES_DIR, schema["name"] + ".yang")
            XML_SKELETON_FILE_PATH = os.path.join(
                XML_SKELETONS_DIR, schema["name"] + ".xml")

            with open(YANG_FILE_PATH, "w") as f:
                # Write the contents of the module to the file
                f.write(yang_module)

        # generate xml skeletons
        for schema in schemas:
            YANG_FILE_PATH = os.path.join(
                YANG_MODULES_DIR, schema["name"] + ".yang")
            XML_SKELETON_FILE_PATH = os.path.join(
                XML_SKELETONS_DIR, schema["name"] + ".xml")

            yang_to_xml_skeleton(YANG_FILE_PATH, XML_SKELETON_FILE_PATH)
