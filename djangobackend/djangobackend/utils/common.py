import os

from lxml import etree

from .data import DEVICE_SCHEMA_RESPONSES_DIR


def validate_device_credentials(device_credentials):
    """
    Validate device credentials
    
    Args:
        device_credentials (dict): Device credentials to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not device_credentials:
        return False
    
    required_fields = ['ip', 'port', 'username', 'password']
    for field in required_fields:
        if field not in device_credentials or not device_credentials[field]:
            return False
    
    # Validate port is a number
    try:
        port = int(device_credentials['port'])
        if port <= 0 or port > 65535:
            return False
    except (ValueError, TypeError):
        return False
    
    return True


def validate_device_id(device_id):
    """
    Validate device ID format
    
    Args:
        device_id (str): Device ID to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not device_id:
        return False
    
    # Device ID should be a non-empty string
    if not isinstance(device_id, str) or len(device_id.strip()) == 0:
        return False
    
    return True


def validate_device_operation(device_credentials, device_id=None):
    """
    Validate device operation parameters
    
    Args:
        device_credentials (dict): Device credentials
        device_id (str, optional): Device ID
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not validate_device_credentials(device_credentials):
        return False, "Invalid device credentials"
    
    if device_id and not validate_device_id(device_id):
        return False, "Invalid device ID"
    
    return True, None


# We removed namespaces but add tjem as attribute
def clean_xml_from_namespaces(root):
    for elem in root.getiterator():
        if not hasattr(elem.tag, 'find'):
            continue
        _h = elem.tag.find('{')
        i = elem.tag.find('}')
        if i >= 0:
            elem.set("xmlns", elem.tag[_h+1:i])
            elem.tag = elem.tag[i+1:]
    etree.cleanup_namespaces(root)


def clear_xml_attributes(root):
    for elem in root.getiterator():
        elem.attrib.clear()


# def reduce_xml_namespaces(root):
#     for elem in root.getiterator():
#         # If any of the ancestor already has the same xmlns attribute,
#         # then remove xmlns from this element
#         if ("xmlns" in elem.attrib.keys() and has_ancestor_attribute(elem, "xmlns", elem.attrib["xmlns"])):
#             # check this
#             elem.attrib.pop("xmlns")


def has_ancestor_attribute(xml_element, attribute_to_find, attribute_value):
    temp = xml_element.getparent()
    while temp is not None:
        # check this
        if attribute_to_find in temp.attrib.keys() and temp.attrib[attribute_to_find] == attribute_value:
            return True
        temp = temp.getparent()
    return False


def get_namespace_attribute_dictionary(root):
    namespaces_dict = {}
    for elem in root.getiterator():
        if "xmlns" in elem.attrib.keys():
            namespaces_dict[elem.tag] = elem.attrib["xmlns"]
    return namespaces_dict


def get_xpath(root, element_name):
    element = root.find(".//" + element_name)
    if element is not None:
        return root.getpath(element)
    return None


def make_xml_from_xpath(x_path, output_root=None):
    elements = x_path.strip('/').split('/')

    # generates the XML element by passing the string
    root = etree.Element(elements[0]) if output_root is None else output_root
    parent = root
    for element in elements[1:]:
        if root.find(".//" + element) is None:
            child = etree.SubElement(parent, element)
            parent = child
        else:
            found_element = root.find(".//" + element)
            parent = found_element

    return root


def make_xml_with_namespaces(root, namespaces):
    for elem in root.getiterator():
        if elem.tag in namespaces.keys():
            elem.set("xmlns", namespaces[elem.tag])


def add_request_parameters(root, body):
    for elem in root.getiterator():
        if elem.tag in body.keys():
            for key in body[elem.tag]:
                request_parameter_tag = etree.SubElement(elem, key)
                request_parameter_tag.text = body[elem.tag][key]


def print_xml_tree(root):
    print(get_xml_tree(root))


def get_xml_tree(root):
    return etree.tostring(root, pretty_print=True).decode()


def print_dict(dict):
    print("Dictionary is:")
    for key in dict:
        print(key, ": ", dict[key])


def has_key(dict, keyToSearch):
    if keyToSearch in dict:
        return True
    return False


def get_schema_rpc_reply(schema):
    with open(os.path.join(DEVICE_SCHEMA_RESPONSES_DIR, schema + '.txt'), 'r') as file:
        return file.read()


def get_device_credentials_list(device_credentials):
    return [device_credentials['ip'],  device_credentials['port'], device_credentials['username'], device_credentials['password'],  False]
