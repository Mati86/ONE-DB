from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class DjangobackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'djangobackend'

    def ready(self):
        """Initialize the app when Django starts"""
        import os
        if os.environ.get('RUN_MAIN', None) != 'true':
            # Only run once when the app starts, not on reload
            try:
                from .utils.background_poller import device_poller
                from .utils.device_storage import get_all_device_ids
                
                # Start polling for all devices
                device_ids = get_all_device_ids()
                if device_ids:
                    device_poller.start_polling_all_devices()
                    logger.info(f"Auto-started polling for {len(device_ids)} devices: {device_ids}")
                else:
                    logger.info("No devices found in storage, polling not started")
                    
            except Exception as e:
                logger.error(f"Failed to start background polling: {e}")
