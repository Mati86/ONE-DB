import json
import re
import redis
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from django.conf import settings
import logging
import time  # Added missing import

logger = logging.getLogger(__name__)

class RedisManager:
    def __init__(self, db_number=0):
        self.db_number = db_number
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=db_number,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )

    def _get_monitoring_key(self, device_id, component, parameter):
        """Generate monitoring data key"""
        return f"device:{device_id}:monitoring:{component}:{parameter}"

    def _get_running_config_key(self, device_id, component, parameter):
        """Generate running configuration key"""
        return f"device:{device_id}:running:{component}:{parameter}"

    def _get_operational_config_key(self, device_id, component, parameter):
        """Generate operational configuration key"""
        return f"device:{device_id}:operational:{component}:{parameter}"

    def _get_timeseries_key(self, device_id, component, parameter):
        """Generate time series data key"""
        return f"device:{device_id}:timeseries:{component}:{parameter}"
    

    def _get_grouped_mux_ports_key(self, device_id):
        """Generate key for grouped MUX ports data"""
        return f"device:{device_id}:monitoring:optical-ports-mux:grouped"

    def _get_grouped_demux_ports_key(self, device_id):
        """Generate key for grouped DEMUX ports data"""
        return f"device:{device_id}:monitoring:optical-ports-demux:grouped"

    def store_monitoring_data(self, device_id, component, parameter, value, timestamp=None):
        """Store monitoring data in Redis and keep only the last 24 hours."""
        utc_now = datetime.now(timezone.utc)
        local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
        iso_timestamp_utc = utc_now.isoformat()
        iso_timestamp_local = local_now.isoformat()
        score_ms = int(time.time() * 1000)

        try:
            if value is None:
                store_value = ""
            else:
                try:
                    store_value = float(value)
                except (TypeError, ValueError):
                    store_value = str(value)
        except Exception as e:
            logger.error(f"Failed to process value for monitoring data: {e} | value={value}")
            store_value = ""

        data = {
            "value": store_value,
            "timestamp": iso_timestamp_utc,
            "timestamp_local": iso_timestamp_local,
            "timezone": "UTC",
            "timezone_local": "Asia/Karachi",
        }

        key = self._get_monitoring_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data))
            timeseries_key = self._get_timeseries_key(device_id, component, parameter)
            self.redis_client.zadd(timeseries_key, {json.dumps(data): score_ms})
            day_ago_ms = score_ms - (24 * 60 * 60 * 1000)
            self.redis_client.zremrangebyscore(timeseries_key, 0, day_ago_ms)
            logger.debug(f"Stored monitoring data: {key} = {store_value}")
            return True
        except Exception as e:
            logger.error(f"Failed to store monitoring data: {e}")
            return False
    def store_grouped_monitoring_data(self, device_id, component, grouped_data, expire_seconds=None):
        """
        Store grouped monitoring data (e.g., all optical ports) under a single key,
        and keep a time series history as one ZSET per component.

        If component is 'optical-ports-mux' or 'optical-ports-demux', use dedicated
        grouped keys to avoid creating per-port keys.
        """
        utc_now = datetime.now(timezone.utc)
        local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
        iso_timestamp_utc = utc_now.isoformat()
        iso_timestamp_local = local_now.isoformat()
        score_ms = int(time.time() * 1000)

        payload = {
            "values": grouped_data,
            "timestamp": iso_timestamp_utc,
            "timestamp_local": iso_timestamp_local,
        }

        # Choose key names
        if component == 'optical-ports-mux':
            current_key = self._get_grouped_mux_ports_key(device_id)
            ts_key = self._get_timeseries_key(device_id, 'optical-ports-mux', 'grouped')
        elif component == 'optical-ports-demux':
            current_key = self._get_grouped_demux_ports_key(device_id)
            ts_key = self._get_timeseries_key(device_id, 'optical-ports-demux', 'grouped')
        else:
            current_key = self._get_monitoring_key(device_id, component, "grouped")
            ts_key = self._get_timeseries_key(device_id, component, "grouped")

        # Overwrite current snapshot
        try:
            if expire_seconds:
                self.redis_client.set(current_key, json.dumps(payload), ex=int(expire_seconds))
            else:
                self.redis_client.set(current_key, json.dumps(payload))

            # Append to time series
            self.redis_client.zadd(ts_key, {json.dumps(payload): score_ms})

            # Remove old (>24h)
            day_ago_ms = score_ms - (24 * 60 * 60 * 1000)
            self.redis_client.zremrangebyscore(ts_key, 0, day_ago_ms)
            return True
        except Exception as e:
            logger.error(f"Failed to store grouped monitoring data: {e}")
            return False

    def get_grouped_port_data(self, device_id, port_type):
        """Get grouped optical port data"""
        try:
            if port_type == 'mux':
                key = self._get_grouped_mux_ports_key(device_id)
            else:
                key = self._get_grouped_demux_ports_key(device_id)
            
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get grouped port data: {e}")
            return None

    def get_monitoring_data(self, device_id, component, parameter):
        """Get current monitoring data"""
        try:
            # The component should now be correctly formed by the frontend (e.g., 'optical-port-mux-4101')
            # So we can directly use _get_monitoring_key to fetch the individual parameter
            key = self._get_monitoring_key(device_id, component, parameter)
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get monitoring data for key {key}: {e}")
            return None
            
    def get_timeseries_data(self, device_id, component, parameter, count=100):
        """Get historical time series data"""
        key = self._get_timeseries_key(device_id, component, parameter)
        try:
            data = self.redis_client.zrevrange(key, 0, count - 1)
            return [json.loads(item) for item in data]
        except Exception as e:
            logger.error(f"Failed to get timeseries data: {e}")
            return []

    def store_running_config(self, device_id, component, parameter, value, user="admin", timestamp=None):
        """Store running configuration set by user"""
        utc_now = datetime.now(timezone.utc)
        local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
        iso_timestamp_utc = utc_now.isoformat()
        iso_timestamp_local = local_now.isoformat()

        data = {
            "value": value,
            "timestamp": iso_timestamp_utc,
            "timestamp_local": iso_timestamp_local,
            "timezone": "UTC",
            "timezone_local": "Asia/Karachi",
            "user": user,
            "source": "user"
        }

        key = self._get_running_config_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data))
            logger.debug(f"Stored running config: {key} = {value}")
            return True
        except Exception as e:
            logger.error(f"Failed to store running config: {e}")
            return False

    def get_running_config(self, device_id, component, parameter):
        """Get running configuration"""
        key = self._get_running_config_key(device_id, component, parameter)
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get running config: {e}")
            return None

    def store_operational_config(self, device_id, component, parameter, value, timestamp=None):
        """Store operational configuration from device"""
        utc_now = datetime.now(timezone.utc)
        local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
        iso_timestamp_utc = utc_now.isoformat()
        iso_timestamp_local = local_now.isoformat()

        data = {
            "value": value,
            "timestamp": iso_timestamp_utc,
            "timestamp_local": iso_timestamp_local,
            "timezone": "UTC",
            "timezone_local": "Asia/Karachi",
            "source": "device"
        }

        key = self._get_operational_config_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data))
            logger.debug(f"Stored operational config: {key} = {value}")
            return True
        except Exception as e:
            logger.error(f"Failed to store operational config: {e}")
            return False

    def get_operational_config(self, device_id, component, parameter):
        """Get operational configuration"""
        key = self._get_operational_config_key(device_id, component, parameter)
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get operational config: {e}")
            return None

    def cleanup_device_data(self, device_id):
        """Clean up all data for a specific device"""
        try:
            pattern = f"device:{device_id}:*"
            keys = self.redis_client.keys(pattern)

            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cleaned up {len(keys)} keys for device {device_id}")

            return True
        except Exception as e:
            logger.error(f"Failed to cleanup device data: {e}")
            return False

    def get_device_status(self, device_id):
        """Get overall device status and data freshness"""
        try:
            monitoring_pattern = f"device:{device_id}:monitoring:*"
            monitoring_keys = self.redis_client.keys(monitoring_pattern)

            if not monitoring_keys:
                return {"status": "no_data", "last_update": None}

            latest_timestamp = None
            for key in monitoring_keys[:10]:
                data = self.redis_client.get(key)
                if data:
                    parsed_data = json.loads(data)
                    if parsed_data.get("timestamp"):
                        if not latest_timestamp or parsed_data["timestamp"] > latest_timestamp:
                            latest_timestamp = parsed_data["timestamp"]

            if latest_timestamp:
                return {
                    "status": "active",
                    "last_update": latest_timestamp,
                    "data_points": len(monitoring_keys)
                }
            else:
                return {"status": "no_data", "last_update": None}

        except Exception as e:
            logger.error(f"Failed to get device status: {e}")
            return {"status": "error", "last_update": None}
        
    

    def get_device_summary(self, device_id):
        """Get comprehensive device data summary"""
        try:
            summary = {
                "device_id": device_id,
                "status": "unknown",
                "last_update": None,
                "components": {
                    "edfa_booster": {"status": "unknown", "data_points": 0},
                    "edfa_preamplifier": {"status": "unknown", "data_points": 0},
                    "optical_ports_mux": {"status": "unknown", "data_points": 0},
                    "optical_ports_demux": {"status": "unknown", "data_points": 0},
                },
                "total_data_points": 0
            }

            components = [
                "edfa-booster",
                "edfa-preamplifier",
                "optical-port-mux-4101",
                "optical-port-demux-5201"
            ]

            total_data_points = 0
            latest_timestamp = None

            for component in components:
                pattern = f"device:{device_id}:monitoring:{component}:*"
                keys = self.redis_client.keys(pattern)

                if keys:
                    component_name = component.replace("-", "_")
                    if "optical-port-mux" in component:
                        component_name = "optical_ports_mux"
                    elif "optical-port-demux" in component:
                        component_name = "optical_ports_demux"

                    summary["components"][component_name]["status"] = "active"
                    summary["components"][component_name]["data_points"] = len(keys)
                    total_data_points += len(keys)

                    for key in keys[:5]:
                        data = self.redis_client.get(key)
                        if data:
                            parsed_data = json.loads(data)
                            if parsed_data.get("timestamp"):
                                if not latest_timestamp or parsed_data["timestamp"] > latest_timestamp:
                                    latest_timestamp = parsed_data["timestamp"]

            summary["total_data_points"] = total_data_points
            summary["last_update"] = latest_timestamp

            if latest_timestamp:
                summary["status"] = "active"
            else:
                summary["status"] = "no_data"

            return summary

        except Exception as e:
            logger.error(f"Failed to get device summary: {e}")
            return {"status": "error", "last_update": None}
        

    


# Create instances for different databases
monitoring_redis = RedisManager(settings.REDIS_DB_MONITORING)
running_config_redis = RedisManager(settings.REDIS_DB_RUNNING_CONFIG)
operational_config_redis = RedisManager(settings.REDIS_DB_OPERATIONAL_CONFIG)

def get_monitoring_data_batch(self, device_id, component, parameters):
        """Get multiple monitoring data points"""
        result = {}
        try:
            for param in parameters:
                # Use the existing get_monitoring_data to fetch each individual parameter
                # This function now correctly handles optical-port-mux/demux components
                data = self.get_monitoring_data(device_id, component, param)
                if data and isinstance(data, dict) and 'value' in data:
                    result[param] = data['value']
                else:
                    result[param] = None # Ensure a null value if data is not found or malformed
            return result
        except Exception as e:
            logger.error(f"Failed to get monitoring data batch for device {device_id}, component {component}, parameters {parameters}: {e}")
            return {param: None for param in parameters} # Return nulls on error