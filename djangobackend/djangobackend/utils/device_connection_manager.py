import logging
from ncclient import manager

# Enable debug logging for the ncclient library
logging.getLogger('ncclient').setLevel(logging.DEBUG)

def get_device_connection(device_credentials):
    """
    Create a device connection using provided credentials
    
    Args:
        device_credentials (dict): Dictionary containing ip, port, username, password
        
    Returns:
        ncclient.manager.Manager: Device connection manager
    """
    return manager.connect(
        host=device_credentials['ip'],
        port=device_credentials['port'],
        username=device_credentials['username'],
        password=device_credentials['password'],
        hostkey_verify=False
    )

# REMOVED: Legacy fallback code that was causing startup failures
# The code below was trying to connect during module import, which is incorrect
# Device connections should only be created when explicitly requested by the frontend

# Legacy fallback for backward compatibility (deprecated) - COMMENTED OUT
# router = {"ip": "10.3.12.101",
#           "port": 830,
#           "user": "superuser",
#           "pass": "Sup%9User"}

# device_connection_manager = get_device_connection({
#     'ip': router["ip"],
#     'port': router["port"],
#     'username': router["user"],
#     'password': router["pass"]
# })