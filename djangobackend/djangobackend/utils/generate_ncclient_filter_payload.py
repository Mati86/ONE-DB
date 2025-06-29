import os

from lxml import etree

from ..settings import BASE_DIR
from .common import (add_request_parameters, clean_xml_from_namespaces,
                     get_namespace_attribute_dictionary, get_xml_tree,
                     get_xpath, make_xml_from_xpath, make_xml_with_namespaces,
                     print_xml_tree)
from .component_to_yang_module_map import YANG_MODULES
from .data import sample_rpc_reply, ensure_device_directories_exist


def generate_ncclient_filter_payload(component, target_parameters, query, device_id=None):
    # Ensure device directories exist
    ensure_device_directories_exist(device_id)
    
    # Try device-specific XML skeleton first, then fall back to components_xml
    if device_id:
        from .data import get_device_xml_skeletons_dir
        device_xml_dir = get_device_xml_skeletons_dir(device_id)
        xml_file_path = os.path.join(device_xml_dir, f"{YANG_MODULES[component]}.xml")
        
        # If device-specific file doesn't exist, fall back to components_xml
        if not os.path.exists(xml_file_path):
            xml_file_path = os.path.join(
                BASE_DIR, 'data', 'components_xml', f"{YANG_MODULES[component]}.xml")
    else:
        # Use components_xml as default
        xml_file_path = os.path.join(
            BASE_DIR, 'data', 'components_xml', f"{YANG_MODULES[component]}.xml")

    # Check if the XML file exists
    if not os.path.exists(xml_file_path):
        raise FileNotFoundError(f"XML skeleton file not found: {xml_file_path}. Please generate schemas for this component first.")

    parser = etree.XMLParser(remove_blank_text=True)
    root = etree.parse(xml_file_path, parser)
    clean_xml_from_namespaces(root)
    # reduce_xml_namespaces(root)

    namespaces_dict = get_namespace_attribute_dictionary(root)

    output_root = None
    for target_parameter in target_parameters:
        # The XPath for the parameter for which we want to generate xml filter
        target_x_path = get_xpath(root, target_parameter)

        # The returned xml is clean without any attribute
        output_root = make_xml_from_xpath(target_x_path, output_root)

    make_xml_with_namespaces(output_root, namespaces_dict)

    # Add any values to tags that are sent from client
    add_request_parameters(output_root, query)

    output_root.tag = "filter"

    return get_xml_tree(output_root)
