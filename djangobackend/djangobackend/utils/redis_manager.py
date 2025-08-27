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

    def _parse_timestamp_to_epoch_ms(self, timestamp):
        """Parse various timestamp formats into epoch milliseconds.

        Accepts:
        - int/float (epoch seconds or ms)
        - ISO-8601 string with or without timezone
        Returns epoch ms (int). Raises ValueError on bad input.
        """
        if timestamp is None:
            raise ValueError("No timestamp provided")

        # numeric timestamp: determine if seconds or milliseconds
        if isinstance(timestamp, (int, float)):
            ts = float(timestamp)
            if ts > 1e12:  # already ms
                return int(ts)
            if ts > 1e9:  # seconds with decimals
                return int(ts * 1000)
            return int(ts * 1000)

        # string: try to parse ISO formats
        if isinstance(timestamp, str):
            try:
                # fromisoformat supports offsets like +00:00
                dt = datetime.fromisoformat(timestamp)
            except Exception:
                # Try appending Z -> +00:00
                try:
                    if timestamp.endswith('Z'):
                        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    else:
                        # last resort: parse as naive UTC
                        dt = datetime.fromisoformat(timestamp)
                except Exception as e:
                    raise ValueError(f"Unrecognized timestamp format: {timestamp}") from e

            # If dt is naive, assume UTC
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)

        raise ValueError(f"Unsupported timestamp type: {type(timestamp)}")

    def store_monitoring_data(self, device_id, component, parameter, value, timestamp=None):
        """Store monitoring data in Redis and keep only the last 24 hours."""
        # Determine score_ms (epoch ms) from provided timestamp or current time
        try:
            if timestamp is not None:
                score_ms = self._parse_timestamp_to_epoch_ms(timestamp)
                # compute local timestamp from epoch ms
                dt = datetime.fromtimestamp(score_ms / 1000, tz=timezone.utc).astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
            else:
                utc_now = datetime.now(timezone.utc)
                local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
                score_ms = int(time.time() * 1000)
        except Exception:
            # Fallback to server time
            utc_now = datetime.now(timezone.utc)
            local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
            iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
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

        # Keep payload minimal to save Redis space: only value and local timestamp in ms precision
        data = {
            "value": store_value,
            "timestamp_local": iso_timestamp_local,
        }

        key = self._get_monitoring_key(device_id, component, parameter)
        try:
            # compact JSON (no spaces) to reduce size
            self.redis_client.set(key, json.dumps(data, separators=(',', ':')))
            timeseries_key = self._get_timeseries_key(device_id, component, parameter)
            # Use device timestamp (score_ms) as the timeseries score, but compute
            # the retention cutoff from server time to avoid accidental mass-deletes
            # when device clocks are skewed.
            self.redis_client.zadd(timeseries_key, {json.dumps(data, separators=(',', ':')): score_ms})
            now_ms = int(time.time() * 1000)
            day_ago_ms = now_ms - (24 * 60 * 60 * 1000)
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
        # Determine score_ms: prefer provided per-port timestamps inside grouped_data
        score_ms = None
        # grouped_data is a dict of port -> {param: value, optional 'timestamp'}
        for port_entry in grouped_data.values():
            try:
                ts = port_entry.get('timestamp')
                if ts:
                    # try parse numeric or ISO
                    try:
                        if isinstance(ts, (int, float)):
                            candidate = int(ts if ts > 1e12 else int(float(ts) * 1000))
                        elif isinstance(ts, str) and ts.isdigit():
                            candidate = int(ts)
                        else:
                            candidate = self._parse_timestamp_to_epoch_ms(ts)
                        if candidate:
                            if score_ms is None or candidate > score_ms:
                                score_ms = candidate
                    except Exception:
                        continue
            except Exception:
                continue

        if score_ms is None:
            # fallback to now
            score_ms = int(time.time() * 1000)

        # compute local timestamp from epoch ms
        dt = datetime.fromtimestamp(score_ms / 1000, tz=timezone.utc).astimezone(ZoneInfo("Asia/Karachi"))
        iso_timestamp_local = dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]

        payload = {
            "values": grouped_data,
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
                self.redis_client.set(current_key, json.dumps(payload, separators=(',', ':')), ex=int(expire_seconds))
            else:
                self.redis_client.set(current_key, json.dumps(payload, separators=(',', ':')))

            # Append to time series (compact JSON) using score_ms determined above
            self.redis_client.zadd(ts_key, {json.dumps(payload, separators=(',', ':')): int(score_ms)})

            # Remove old (>24h) using server time as cutoff to avoid deleting
            # recent entries when device timestamps are skewed.
            now_ms = int(time.time() * 1000)
            day_ago_ms = now_ms - (24 * 60 * 60 * 1000)
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
        # Handle grouped optical port keys: component like 'optical-port-mux-4101' or 'optical-port-demux-5201'
        m = re.match(r'^optical-port-(mux|demux)-(\d+)$', component)
        try:
            if m:
                port_type = m.group(1)  # 'mux' or 'demux'
                port_no = m.group(2)
                if port_type == 'mux':
                    key = self._get_grouped_mux_ports_key(device_id)
                else:
                    key = self._get_grouped_demux_ports_key(device_id)

                raw = self.redis_client.get(key)
                if not raw:
                    return None
                payload = json.loads(raw)
                values = payload.get('values') or {}
                port_values = values.get(str(port_no)) or {}
                # Return minimal shape: value and timestamp_local
                val = port_values.get(parameter)
                return {
                    'value': val,
                    'timestamp_local': payload.get('timestamp_local')
                }

            # Fallback: regular per-parameter key
            key = self._get_monitoring_key(device_id, component, parameter)
            data = self.redis_client.get(key)
            if not data:
                return None
            parsed = json.loads(data)
            # older callers may expect 'timestamp' key; normalize to timestamp_local
            if 'timestamp' in parsed and 'timestamp_local' not in parsed:
                parsed['timestamp_local'] = parsed.pop('timestamp')
            return parsed
        except Exception as e:
            logger.error(f"Failed to get monitoring data: {e}")
            return None

    def get_monitoring_data_batch(self, device_id, component, parameters):
        """Get multiple monitoring data points"""
        keys = [self._get_monitoring_key(device_id, component, param) for param in parameters]
        try:
            data_list = self.redis_client.mget(keys)
            result = {}
            for i, param in enumerate(parameters):
                result[param] = json.loads(data_list[i]) if data_list[i] else None
            return result
        except Exception as e:
            logger.error(f"Failed to get monitoring data batch: {e}")
            return {param: None for param in parameters}

    def get_timeseries_data(self, device_id, component, parameter, count=100):
        """Get historical time series data"""
        key = self._get_timeseries_key(device_id, component, parameter)
        try:
            data = self.redis_client.zrevrange(key, 0, count - 1)
            result = []
            for item in data:
                try:
                    parsed = json.loads(item)
                    # normalize timestamps if necessary
                    if 'timestamp' in parsed and 'timestamp_local' not in parsed:
                        parsed['timestamp_local'] = parsed.pop('timestamp')
                    result.append(parsed)
                except Exception:
                    # skip malformed entries
                    continue
            return result
        except Exception as e:
            logger.error(f"Failed to get timeseries data: {e}")
            return []

    def store_running_config(self, device_id, component, parameter, value, user="admin", timestamp=None):
        """Store running configuration set by user"""
        # Use provided timestamp if present
        if timestamp is not None:
            try:
                score_ms = self._parse_timestamp_to_epoch_ms(timestamp)
                dt = datetime.fromtimestamp(score_ms / 1000, tz=timezone.utc).astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
            except Exception:
                utc_now = datetime.now(timezone.utc)
                local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        else:
            utc_now = datetime.now(timezone.utc)
            local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
            iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]

        data = {
            "value": value,
            "timestamp_local": iso_timestamp_local,
            "user": user,
            "source": "user"
        }

        key = self._get_running_config_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data, separators=(',', ':')))
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
        if timestamp is not None:
            try:
                score_ms = self._parse_timestamp_to_epoch_ms(timestamp)
                dt = datetime.fromtimestamp(score_ms / 1000, tz=timezone.utc).astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
            except Exception:
                utc_now = datetime.now(timezone.utc)
                local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
                iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
        else:
            utc_now = datetime.now(timezone.utc)
            local_now = utc_now.astimezone(ZoneInfo("Asia/Karachi"))
            iso_timestamp_local = local_now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]

        data = {
            "value": value,
            "timestamp_local": iso_timestamp_local,
            "source": "device"
        }

        key = self._get_operational_config_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data, separators=(',', ':')))
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