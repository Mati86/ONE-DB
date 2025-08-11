import json
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Device storage file path
DEVICE_STORAGE_FILE = os.path.join(settings.BASE_DIR, 'device_storage.json')

def ensure_device_storage_exists():
    """Ensure device storage file exists"""
    if not os.path.exists(DEVICE_STORAGE_FILE):
        with open(DEVICE_STORAGE_FILE, 'w') as f:
            json.dump({}, f)

def get_all_devices():
    """Get all devices from storage"""
    try:
        ensure_device_storage_exists()
        with open(DEVICE_STORAGE_FILE, 'r') as f:
            devices_data = json.load(f)
            
        # Convert the format to match expected structure
        devices = {}
        for device_id, credentials in devices_data.items():
            # Convert port to int if it's a string
            if isinstance(credentials.get('port'), str):
                credentials['port'] = int(credentials['port'])
            
            devices[device_id] = {
                'id': device_id,
                'name': f"Device-{device_id[:8]}",  # Use first 8 chars of UUID as name
                'credentials': credentials,
                'dataRefreshInterval': 2  # Default to 2 seconds
            }
        return devices
    except Exception as e:
        logger.error(f"Failed to read device storage: {e}")
        return {}

def get_device_by_id(device_id):
    """Get device by ID"""
    devices = get_all_devices()
    return devices.get(device_id)

def save_device(device_id, device_data):
    """Save device to storage"""
    try:
        ensure_device_storage_exists()
        devices = get_all_devices()
        devices[device_id] = device_data
        
        # Convert back to the simple format for storage
        storage_data = {}
        for dev_id, dev_data in devices.items():
            storage_data[dev_id] = dev_data.get('credentials', {})
        
        with open(DEVICE_STORAGE_FILE, 'w') as f:
            json.dump(storage_data, f, indent=2)
        
        logger.info(f"Saved device {device_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to save device {device_id}: {e}")
        return False

def delete_device(device_id):
    """Delete device from storage"""
    try:
        ensure_device_storage_exists()
        devices = get_all_devices()
        
        if device_id in devices:
            del devices[device_id]
            
            # Convert back to the simple format for storage
            storage_data = {}
            for dev_id, dev_data in devices.items():
                storage_data[dev_id] = dev_data.get('credentials', {})
            
            with open(DEVICE_STORAGE_FILE, 'w') as f:
                json.dump(storage_data, f, indent=2)
            
            logger.info(f"Deleted device {device_id}")
            return True
        else:
            logger.warning(f"Device {device_id} not found in storage")
            return False
    except Exception as e:
        logger.error(f"Failed to delete device {device_id}: {e}")
        return False

def get_device_credentials(device_id):
    """Get device credentials by ID"""
    device = get_device_by_id(device_id)
    if device:
        return device.get('credentials')
    return None

def get_all_device_ids():
    """Get all device IDs from storage"""
    devices = get_all_devices()
    return list(devices.keys()) 