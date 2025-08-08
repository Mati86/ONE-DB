import json
import redis
from datetime import datetime
from django.conf import settings
import logging

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
    
    def store_monitoring_data(self, device_id, component, parameter, value, timestamp=None):
        """Store monitoring data with timestamp"""
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        data = {
            "value": value,
            "timestamp": timestamp
        }
        
        key = self._get_monitoring_key(device_id, component, parameter)
        try:
            self.redis_client.set(key, json.dumps(data))
            
            # Also store in time series for historical data
            timeseries_key = self._get_timeseries_key(device_id, component, parameter)
            self.redis_client.zadd(timeseries_key, {json.dumps(data): timestamp})
            
            # Keep only last 1000 entries in time series
            self.redis_client.zremrangebyrank(timeseries_key, 0, -1001)
            
            logger.debug(f"Stored monitoring data: {key} = {value}")
            return True
        except Exception as e:
            logger.error(f"Failed to store monitoring data: {e}")
            return False
    
    def get_monitoring_data(self, device_id, component, parameter):
        """Get current monitoring data"""
        key = self._get_monitoring_key(device_id, component, parameter)
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
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
                if data_list[i]:
                    result[param] = json.loads(data_list[i])
                else:
                    result[param] = None
            return result
        except Exception as e:
            logger.error(f"Failed to get monitoring data batch: {e}")
            return {param: None for param in parameters}
    
    def get_timeseries_data(self, device_id, component, parameter, count=100):
        """Get historical time series data"""
        key = self._get_timeseries_key(device_id, component, parameter)
        try:
            data = self.redis_client.zrevrange(key, 0, count-1)
            return [json.loads(item) for item in data]
        except Exception as e:
            logger.error(f"Failed to get timeseries data: {e}")
            return []
    
    def store_running_config(self, device_id, component, parameter, value, user="admin", timestamp=None):
        """Store running configuration set by user"""
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        data = {
            "value": value,
            "timestamp": timestamp,
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
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        data = {
            "value": value,
            "timestamp": timestamp,
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
            # Get all keys for this device
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
            # Get some sample keys to check if device has data
            monitoring_pattern = f"device:{device_id}:monitoring:*"
            monitoring_keys = self.redis_client.keys(monitoring_pattern)
            
            if not monitoring_keys:
                return {"status": "no_data", "last_update": None}
            
            # Get the most recent timestamp
            latest_timestamp = None
            for key in monitoring_keys[:10]:  # Check first 10 keys
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
            
            # Check monitoring data for each component
            components = [
                "edfa-booster",
                "edfa-preamplifier", 
                "optical-port-mux-4101",  # Sample MUX port
                "optical-port-demux-5201"  # Sample DEMUX port
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
                    
                    # Get latest timestamp from this component
                    for key in keys[:5]:  # Check first 5 keys
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