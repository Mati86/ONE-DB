import os

# from .ncclient_manager import ncclient_manager
from .data import get_device_yang_modules_dir, get_device_xml_skeletons_dir
from .yang_to_xml_skeleton import yang_to_xml_skeleton


def generate_schema_dependencies(schemas, device_id=None):
    # Get device-specific directories
    yang_modules_dir = get_device_yang_modules_dir(device_id)
    xml_skeletons_dir = get_device_xml_skeletons_dir(device_id)
    
    for schema in schemas:
        YANG_FILE_PATH = os.path.join(
            yang_modules_dir, schema["name"] + ".yang")
        XML_SKELETON_FILE_PATH = os.path.join(
            xml_skeletons_dir, schema["dependency_name"] + ".xml")
        yang_to_xml_skeleton(
            YANG_FILE_PATH, XML_SKELETON_FILE_PATH, schema['dependencies'], device_id=device_id)
