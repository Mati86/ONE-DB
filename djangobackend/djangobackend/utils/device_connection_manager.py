import logging

from ncclient import manager

# Enable debug logging for the ncclient library
logging.getLogger('ncclient').setLevel(logging.DEBUG)

router = {"ip": "10.3.12.101",
          "port": 830,
          "user": "superuser",
          "pass": "Sup%9User"}

device_connection_manager = manager.connect(host=router["ip"],
                                            port=router["port"],
                                            username=router["user"],
                                            password=router["pass"],
                                            hostkey_verify=False)
