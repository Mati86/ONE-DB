import os

from lxml import etree

from ..settings import BASE_DIR
from .common import (add_request_parameters, clean_xml_from_namespaces,
                     get_namespace_attribute_dictionary, get_xml_tree,
                     get_xpath, make_xml_from_xpath, make_xml_with_namespaces)
from .component_to_yang_module_map import YANG_MODULES


def generate_ncclient_config_payload(component, target_parameter, value, query):
    xml_file_path = os.path.join(
        BASE_DIR, 'data', 'components_xml', f"{YANG_MODULES[component]}.xml")

    parser = etree.XMLParser(remove_blank_text=True)
    root = etree.parse(xml_file_path, parser)
    clean_xml_from_namespaces(root)
    # reduce_xml_namespaces(root)

    namespaces_dict = get_namespace_attribute_dictionary(root)

    # The XPath for the parameter for which we want to generate xml filter
    target_x_path = get_xpath(root, target_parameter)
    # The returned xml is clean without any attribute
    output_root = make_xml_from_xpath(target_x_path)
    output_root.find(".//" + target_parameter).text = value

    make_xml_with_namespaces(output_root, namespaces_dict)

    # Add any values to tags that are sent from client
    add_request_parameters(output_root, query)

    output_root.tag = "config"

    return get_xml_tree(output_root)
