import os

# from .ncclient_manager import ncclient_manager
from .data import XML_SKELETONS_DIR, YANG_MODULES_DIR
from .yang_to_xml_skeleton import yang_to_xml_skeleton


def generate_schema_dependencies(schemas):
    for schema in schemas:
        YANG_FILE_PATH = os.path.join(
            YANG_MODULES_DIR, schema["name"] + ".yang")
        XML_SKELETON_FILE_PATH = os.path.join(
            XML_SKELETONS_DIR, schema["dependency_name"] + ".xml")
        yang_to_xml_skeleton(
            YANG_FILE_PATH, XML_SKELETON_FILE_PATH, schema['dependencies'])
