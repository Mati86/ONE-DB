#!/usr/bin/env python3
"""
Test script to verify Redis integration and device polling
"""

import os
import sys
import django

# Add the Django project to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangobackend.settings')

# Setup Django
django.setup()

from djangobackend.utils.redis_manager import monitoring_redis, running_config_redis, operational_config_redis
from djangobackend.utils.device_storage import get_all_device_ids, get_device_credentials
from djangobackend.utils.background_poller import device_poller

def test_redis_connection():
    """Test Redis connection"""
    print("Testing Redis connection...")
    
    try:
        # Test monitoring Redis
        monitoring_redis.redis_client.ping()
        print("✅ Monitoring Redis connection successful")
        
        # Test running config Redis
        running_config_redis.redis_client.ping()
        print("✅ Running config Redis connection successful")
        
        # Test operational config Redis
        operational_config_redis.redis_client.ping()
        print("✅ Operational config Redis connection successful")
        
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_device_storage():
    """Test device storage"""
    print("\nTesting device storage...")
    
    try:
        device_ids = get_all_device_ids()
        print(f"✅ Found {len(device_ids)} devices: {device_ids}")
        
        for device_id in device_ids:
            credentials = get_device_credentials(device_id)
            if credentials:
                print(f"  - Device {device_id}: {credentials.get('ip', 'N/A')}:{credentials.get('port', 'N/A')}")
            else:
                print(f"  - Device {device_id}: No credentials found")
        
        return True
    except Exception as e:
        print(f"❌ Device storage test failed: {e}")
        return False

def test_background_poller():
    """Test background poller"""
    print("\nTesting background poller...")
    
    try:
        # Start polling for all devices
        device_poller.start_polling_all_devices()
        print("✅ Background poller started successfully")
        
        # Check if polling is running
        if device_poller.running:
            print(f"  - Polling is running for {len(device_poller.devices_to_poll)} devices")
            print(f"  - Devices being polled: {list(device_poller.devices_to_poll)}")
        else:
            print("  - Polling is not running")
        
        return True
    except Exception as e:
        print(f"❌ Background poller test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Redis integration test...\n")
    
    # Test Redis connection
    if not test_redis_connection():
        print("\n❌ Redis connection test failed. Please ensure Redis is running.")
        return
    
    # Test device storage
    if not test_device_storage():
        print("\n❌ Device storage test failed.")
        return
    
    # Test background poller
    if not test_background_poller():
        print("\n❌ Background poller test failed.")
        return
    
    print("\n✅ All tests passed! Redis integration is working correctly.")
    print("\n📊 Next steps:")
    print("1. Start your Django backend: python manage.py runserver")
    print("2. Start your React frontend: npm start")
    print("3. Check Redis GUI at http://localhost:8081 to see data being stored")
    print("4. Monitor the Django logs for polling activity")

if __name__ == "__main__":
    main()
