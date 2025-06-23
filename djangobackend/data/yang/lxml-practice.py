

# We will use the lxml library to parse or iterate the xml structure of our
# network device components and also to generate nc client filters.
# So it is very important to understand the api of this library


# cd djangobackend/data/yang_modules

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" -f sample-xml-skeleton -o ../components_xml/lumentum-ote-port-optical.xml lumentum-ote-port-optical.yang

# python "C:\Users\Rohail Taha\AppData\Local\Programs\Python\Python311\Scripts\pyang" - f sample-xml-skeleton - o ../components_xml/lumentum-ote-port-optical.xml temp.yang

from lxml import etree


def print_xml_tree(root):
    print(etree.tostring(root, pretty_print=True).decode())


filter = etree.Element("filter")
edfas = etree.SubElement(filter, 'edfas')
etree.SubElement(edfas, 'edfa')
etree.SubElement(filter, 'edfas-metadata')

# xml elements behave like lists

# print(etree.tostring(edfas, pretty_print=True).decode())

# print(filter.index(filter[0]))
# print(len(filter))

# for child in filter:
#   print(child.tag)

# TO get parent:-
# if filter is not edfas[0].getparent():
#   print('yes')

# TO get sibling:-
# print(filter[0].getnext())
# print(filter[1].getprevious())

# Attributes:-
filter.set("xmlns", "hello")
test = etree.Element('test', xmlns="hello")
print_xml_tree(filter)
print_xml_tree(test)
