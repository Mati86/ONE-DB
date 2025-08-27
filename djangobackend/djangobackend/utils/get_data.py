from lxml import etree
from datetime import datetime, timezone
import time

from .common import (
    clean_xml_from_namespaces,
    validate_device_credentials,
)
from .generate_ncclient_filter_payload import generate_ncclient_filter_payload
from .device_connection_manager import get_device_connection
import logging

logger = logging.getLogger(__name__)


def get_parameters_array(target_parameter):
    """Ensure parameters are always a list."""
    return target_parameter if isinstance(target_parameter, list) else [target_parameter]


def get_target_params_dict(target_parameters):
    """Initialize dict with all params as empty."""
    return {parameter: None for parameter in target_parameters}


def get_data(device_credentials, component, target_parameter, query, device_id=None):
    """
    Poll NETCONF device for given parameters using XML skeletons.
    Returns dict of parameter -> value, plus timestamp.
    """
    if not validate_device_credentials(device_credentials):
        raise ValueError("Invalid device credentials")

    # Normalize parameters
    target_parameters = get_parameters_array(target_parameter)
    result = get_target_params_dict(target_parameters)

    # We'll set timestamp after polling: prefer device-provided timestamp when available.

    # Build NETCONF filter
    netconf_filter = generate_ncclient_filter_payload(
        component, target_parameters, query, device_id
    )

    # Get or create NETCONF session
    session = get_device_connection(device_credentials)

    try:
        t0 = time.time()
        rpc_reply = session.get(filter=netconf_filter)
        t1 = time.time()
        rpc_reply_xml = rpc_reply.xml
        logger.debug(f"NETCONF fetch for {device_id} took {(t1-t0)*1000:.1f} ms")

        response_root = etree.fromstring(rpc_reply_xml.encode("utf-8"))
        clean_xml_from_namespaces(response_root)

        # Extract requested parameters
        for parameter in target_parameters:
            element = response_root.find(f".//{parameter}")
            result[parameter] = element.text if element is not None else None

        # Try to extract a device-provided timestamp from common element names
        ts = None
        for candidate in ("timestamp", "time", "event-time", "time-stamp", "last-changed", "last-updated"):
            el = response_root.find(f".//{candidate}")
            if el is not None and el.text:
                ts = el.text.strip()
                break

        # If timestamp looks numeric (epoch seconds or ms), convert to int
        if ts is not None:
            try:
                if ts.isdigit():
                    # numeric string
                    num = int(ts)
                    result["timestamp"] = num
                else:
                    result["timestamp"] = ts
            except Exception:
                result["timestamp"] = ts
        else:
            # fallback to server time in UTC ISO
            result["timestamp"] = datetime.now(timezone.utc).isoformat()

    except Exception as e:
        logger.exception("NETCONF get failed")
        raise Exception(f"Failed to retrieve data: {str(e)}")

    return result
