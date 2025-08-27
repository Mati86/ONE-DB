from ncclient import manager
import threading
import time
import logging

logger = logging.getLogger(__name__)

# Cache of active NETCONF sessions
_sessions = {}
_lock = threading.Lock()


def _create_new_session(device_credentials, timeout=15):
    """Create and return a new NETCONF session."""
    return manager.connect(
        host=device_credentials["ip"],
        port=device_credentials["port"],
        username=device_credentials["username"],
        password=device_credentials["password"],
        hostkey_verify=False,
        device_params={'name': 'default'},
        allow_agent=False,
        look_for_keys=False,
        timeout=timeout,
    )


def get_device_connection(device_credentials, retries=2, retry_delay=0.25):
    """
    Return an active NETCONF session.
    If existing session is broken, auto-reconnect. Retries on connect failures.
    """
    key = (device_credentials["ip"], device_credentials["port"], device_credentials["username"])

    with _lock:
        if key in _sessions:
            session = _sessions[key]
            try:
                if getattr(session, 'connected', False):
                    return session
            except Exception:
                pass

            # close and remove stale session
            try:
                session.close_session()
            except Exception:
                pass
            del _sessions[key]

        last_exc = None
        for attempt in range(1, retries + 1):
            try:
                session = _create_new_session(device_credentials)
                _sessions[key] = session
                logger.debug(f"Opened NETCONF session to {device_credentials['ip']}:{device_credentials['port']}")
                return session
            except Exception as e:
                last_exc = e
                logger.warning(f"NETCONF connect attempt {attempt} failed for {device_credentials['ip']}: {e}")
                time.sleep(retry_delay)

        # If we reach here, all retries failed
        logger.error(f"Failed to create NETCONF session to {device_credentials['ip']} after {retries} attempts: {last_exc}")
        raise last_exc
