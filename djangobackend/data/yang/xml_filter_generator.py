from lxml import etree

# sample request body: { dn: "", parameter }
body = {
    "edfa": {"dn": "ne=1;chassis=1;card=1;edfa=1"},
}


def clean_xml_from_namespaces(root):
    for elem in root.getiterator():
        if not hasattr(elem.tag, 'find'):
            continue
        _h = elem.tag.find('{')
        i = elem.tag.find('}')
        if i >= 0:
            # We have removed namespaces but are adding it as an attribute
            elem.set("xmlns", elem.tag[_h+1:i])
            elem.tag = elem.tag[i+1:]
    etree.cleanup_namespaces(root)


def reduce_xml_namespaces(root):
    for elem in root.getiterator():
        # If any of the ancestor already has the same xmlns attribute,
        # then remove xmlns from this element
        if ("xmlns" in elem.attrib.keys() and has_ancestor_attribute(elem, "xmlns", elem.attrib["xmlns"])):
            # check this
            elem.attrib.pop("xmlns")


def has_ancestor_attribute(xml_element, attribute_to_find, attribute_value):
    temp = xml_element.getparent()
    while temp is not None:
        # check this
        if attribute_to_find in temp.attrib.keys() and temp.attrib[attribute_to_find] == attribute_value:
            return True
        temp = temp.getparent()
    return False


def get_namespace_attribute_dictionary(root):
    ns_dict = {}
    for elem in root.getiterator():
        if "xmlns" in elem.attrib.keys():
            ns_dict[elem.tag] = elem.attrib["xmlns"]
    return ns_dict


def get_xpath(root, element_name):
    element = root.find(".//" + element_name)
    if element is not None:
        return root.getpath(element)
    else:
        return None


def make_xml_from_xpath(x_path):
    elements = x_path.strip('/').split('/')

    # generates the XML element by passing the string
    root = etree.Element(elements[0])
    parent = root
    for element in elements[1:]:
        child = etree.SubElement(parent, element)
        parent = child
    return root


def make_xml_with_namespaces(root, namespaces):
    for elem in root.getiterator():
        if elem.tag in namespaces.keys():
            elem.set("xmlns", namespaces[elem.tag])


def add_request_parameters(root, request_body):
    for elem in root.getiterator():
        if elem.tag in request_body.keys():
            for key in request_body[elem.tag]:
                request_parameter_tag = etree.SubElement(elem, key)
                request_parameter_tag.text = request_body[elem.tag][key]


def print_xml_tree(root):
    print(get_xml_tree(root))


def get_xml_tree(root):
    return etree.tostring(root, pretty_print=True).decode()


parser = etree.XMLParser(remove_blank_text=True)
xml_root = etree.parse("djangobackend/data/yang/output.xml", parser)
clean_xml_from_namespaces(xml_root)
reduce_xml_namespaces(xml_root)

namespaces_dict = get_namespace_attribute_dictionary(xml_root)

# The parameter for which we want to generate xml filter
TARGET_PARAMETER = "input-power"
# The XPath for the parameter for which we want to generate xml filter
targetXPath = get_xpath(xml_root, TARGET_PARAMETER)
# The returned xml is clean without any attribute
output_root = make_xml_from_xpath(targetXPath)

make_xml_with_namespaces(output_root, namespaces_dict)
add_request_parameters(output_root, body)

# print(get_xml_with_namespaces(output_root, namespaces_dict))

output_root.tag = "filter"
print_xml_tree(output_root)
