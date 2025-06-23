import os
import subprocess

from .data import YANG_MODULES_DIR

# yang_file = "./data/generated_yang_modules/lumentum-ote-port.yang"
# param = "./data/generated_yang_modules/lumentum-ote-port-optical.yang"

# output_file_path = "./Netconf-Python/practice/lumentum-ote-port-optical.xml"


def yang_to_xml_skeleton(yang_file_path, output_file_path, yang_file_dependencies=[], modules_search_path=YANG_MODULES_DIR, yang_file_dependencies_path=YANG_MODULES_DIR):
    # Set the pyang command arguments
    command = ["python", "C:\\Users\\Rohail Taha\\AppData\\Local\\Programs\\Python\\Python311\\Scripts\\pyang",
               "-f", "sample-xml-skeleton", yang_file_path]

    for yang_file_dependency in yang_file_dependencies:
        command.append(os.path.join(yang_file_dependencies_path, yang_file_dependency + ".yang")
                       )

    command.append("-p")
    command.append(modules_search_path)

    with open(output_file_path, "w") as outfile:

        result = subprocess.run(command, stdout=outfile,
                                stderr=subprocess.PIPE)

        if result.returncode == 0:
            print("pyang command succeeded")
        else:
            print("pyang command failed with error:",
                  result.stderr.decode("utf-8"))
