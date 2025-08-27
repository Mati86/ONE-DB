import threading
import time
import concurrent.futures
import logging
from datetime import datetime, timezone
from django.conf import settings
from .redis_manager import monitoring_redis, operational_config_redis, running_config_redis
from .get_data import get_data
from .edit_data import edit_data
from .common import get_device_credentials_list, validate_device_credentials, get_device_credentials_by_id
from .device_storage import get_all_device_ids

logger = logging.getLogger(__name__)

class DeviceDataPoller:
    def __init__(self):
        self.running = False
        self.poll_thread = None
        self.poll_interval = settings.DEVICE_DATA_POLL_INTERVAL
        self.devices_to_poll = set()
        
    def start_polling(self, device_id):
        """Start polling for a specific device"""
        self.devices_to_poll.add(device_id)
        if not self.running:
            self.running = True
            self.poll_thread = threading.Thread(target=self._poll_loop, daemon=True)
            self.poll_thread.start()
            logger.info(f"Started background polling for device {device_id}")
    
    def stop_polling(self, device_id):
        """Stop polling for a specific device"""
        self.devices_to_poll.discard(device_id)
        if not self.devices_to_poll and self.running:
            self.running = False
            logger.info(f"Stopped background polling for device {device_id}")
    
    def start_polling_all_devices(self):
        """Start polling for all devices in storage"""
        try:
            device_ids = get_all_device_ids()
            for device_id in device_ids:
                self.start_polling(device_id)
            logger.info(f"Started polling for {len(device_ids)} devices")
        except Exception as e:
            logger.error(f"Error starting polling for all devices: {e}")
    
    def _poll_loop(self):
        """Main polling loop"""
        while self.running:
            try:
                device_ids = list(self.devices_to_poll)
                if device_ids:
                    # Parallelize device polling to reduce end-to-end delay
                    max_workers = min(32, max(1, len(device_ids)))
                    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                        futures = {executor.submit(self._poll_device_data, d): d for d in device_ids}
                        for fut in concurrent.futures.as_completed(futures):
                            dev = futures[fut]
                            try:
                                fut.result()
                            except Exception as e:
                                logger.error(f"Error polling device {dev}: {e}")

                # Sleep for the configured interval
                time.sleep(self.poll_interval)

            except Exception as e:
                logger.error(f"Error in polling loop: {e}")
                time.sleep(5)  # Wait before retrying
    
    def _poll_device_data(self, device_id):
        """Poll data for a specific device"""
        try:
            # Get device credentials from storage
            device_credentials = get_device_credentials_by_id(device_id)
            
            if not device_credentials:
                logger.warning(f"No credentials found for device {device_id}")
                return
            
            # Validate credentials
            if not validate_device_credentials(device_credentials):
                logger.warning(f"Invalid credentials for device {device_id}")
                return
            
            # Poll EDFA data (booster and preamplifier), grouped ports and operational config in parallel
            tasks = [
                (self._poll_edfa_data, (device_id, device_credentials, 'booster')),
                (self._poll_edfa_data, (device_id, device_credentials, 'preamplifier')),
                (self._poll_grouped_optical_ports_data, (device_id, device_credentials)),
                (self._poll_operational_config, (device_id, device_credentials)),
            ]

            # Use a small executor for per-device parallelism
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, len(tasks))) as ex:
                futures = [ex.submit(fn, *args) for fn, args in tasks]
                for fut in concurrent.futures.as_completed(futures):
                    try:
                        fut.result()
                    except Exception as e:
                        logger.error(f"Error in device {device_id} subtask: {e}")
            
        except Exception as e:
            logger.error(f"Error polling device {device_id}: {e}")
    
    def _poll_edfa_data(self, device_id, device_credentials, edfa_type):
        """Poll EDFA monitoring data"""
        try:
            from .data import EDFA_PARAMS
            
            # Define monitoring parameters based on EDFA type
            if edfa_type == 'booster':
                monitoring_params = [
                    EDFA_PARAMS['InputPower'],
                    EDFA_PARAMS['OutputPower'],
                    EDFA_PARAMS['MeasuredGain'],
                    EDFA_PARAMS['BackReflectionPower'],
                    EDFA_PARAMS['OpticalReturnLoss'],
                    EDFA_PARAMS['AlsDisabledSecondsRemaining'],
                    EDFA_PARAMS['EntityDescription'],
                    EDFA_PARAMS['OperationalState'],
                ]
            else:  # preamplifier
                monitoring_params = [
                    EDFA_PARAMS['InputPower'],
                    EDFA_PARAMS['OutputPower'],
                    EDFA_PARAMS['MeasuredGain'],
                    EDFA_PARAMS['EntityDescription'],
                    EDFA_PARAMS['OperationalState'],
                ]
            
            # Get data from device
            data = get_data(
                device_credentials,
                'edfa',
                monitoring_params,
                {'edfa': {'dn': f'ne=1;chassis=1;card=1;edfa={1 if edfa_type == "booster" else 2}'}} ,
                device_id
            )

            # Use device-provided timestamp when available
            device_ts = data.get('timestamp')
            for param, value in data.items():
                if param == 'timestamp':
                    continue
                if value is not None:
                    monitoring_redis.store_monitoring_data(
                        device_id,
                        f'edfa-{edfa_type}',
                        param,
                        value,
                        device_ts
                    )
            
            logger.debug(f"Polled {len(data)} parameters for {edfa_type} EDFA on device {device_id}")
            
        except Exception as e:
            logger.error(f"Error polling {edfa_type} EDFA data for device {device_id}: {e}")

    
    # ... (keep all existing methods the same until _poll_all_optical_ports_data) ...

    def _poll_grouped_optical_ports_data(self, device_id, creds):
        """Poll all optical ports (mux and demux) and store them as grouped keys."""
        from .data import OPTICAL_PORT_PARAMS, MUX_OPTICAL_PORT_NUMBERS, DEMUX_OPTICAL_PORT_NUMBERS

        params = [
            OPTICAL_PORT_PARAMS["InputPower"],
            OPTICAL_PORT_PARAMS["OutputPower"],
            OPTICAL_PORT_PARAMS["EntityDescription"],
            OPTICAL_PORT_PARAMS["OperationalState"],
        ]

        mux_data = {}
        # Poll mux ports in parallel to reduce total latency
        def poll_mux(port):
            try:
                data = get_data(
                    creds, "optical-port", params,
                    {"physical-port": {"dn": f"ne=1;chassis=1;card=1;port={port}"}}, device_id
                )
                ts = data.get('timestamp')
                entry = {p: v for p, v in data.items() if p != 'timestamp' and v is not None}
                if ts is not None:
                    entry['timestamp'] = ts
                return (str(port), entry)
            except Exception as e:
                logger.debug(f"Error polling mux port {port}: {e}")
                return (str(port), {})

        with concurrent.futures.ThreadPoolExecutor(max_workers=min(8, len(MUX_OPTICAL_PORT_NUMBERS))) as mux_executor:
            mux_futs = [mux_executor.submit(poll_mux, p) for p in MUX_OPTICAL_PORT_NUMBERS]
            for fut in concurrent.futures.as_completed(mux_futs):
                port, entry = fut.result()
                mux_data[port] = entry

        demux_data = {}
        # Poll demux ports in parallel
        def poll_demux(port):
            try:
                data = get_data(
                    creds, "optical-port", params,
                    {"physical-port": {"dn": f"ne=1;chassis=1;card=1;port={port}"}}, device_id
                )
                ts = data.get('timestamp')
                entry = {p: v for p, v in data.items() if p != 'timestamp' and v is not None}
                if ts is not None:
                    entry['timestamp'] = ts
                return (str(port), entry)
            except Exception as e:
                logger.debug(f"Error polling demux port {port}: {e}")
                return (str(port), {})

        with concurrent.futures.ThreadPoolExecutor(max_workers=min(8, len(DEMUX_OPTICAL_PORT_NUMBERS))) as demux_executor:
            demux_futs = [demux_executor.submit(poll_demux, p) for p in DEMUX_OPTICAL_PORT_NUMBERS]
            for fut in concurrent.futures.as_completed(demux_futs):
                port, entry = fut.result()
                demux_data[port] = entry

        if mux_data:
            monitoring_redis.store_grouped_monitoring_data(device_id, "optical-ports-mux", mux_data)
        if demux_data:
            monitoring_redis.store_grouped_monitoring_data(device_id, "optical-ports-demux", demux_data)

    # ... (keep all other existing methods exactly the same) ...
    
    def configure_device_parameter(self, device_id, component, target_parameter, value, query):
        """Configure a parameter on a device"""
        try:
            # Get device credentials from storage
            device_credentials = get_device_credentials_by_id(device_id)
            
            if not device_credentials:
                logger.warning(f"No credentials found for device {device_id}")
                return False
            
            # Validate credentials
            if not validate_device_credentials(device_credentials):
                logger.warning(f"Invalid credentials for device {device_id}")
                return False
            
            # Use edit_data to configure the parameter
            edit_data(device_credentials, component, target_parameter, value, query, device_id)
            logger.info(f"Successfully configured {target_parameter} on device {device_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error configuring parameter {target_parameter} on device {device_id}: {e}")
            return False

    def _poll_operational_config(self, device_id, device_credentials):
        """Poll operational configuration from device"""
        try:
            from .data import EDFA_PARAMS, OPTICAL_PORT_PARAMS, MUX_OPTICAL_PORT_NUMBERS, DEMUX_OPTICAL_PORT_NUMBERS
            
            # Poll EDFA operational configuration
            booster_config_params = [
                EDFA_PARAMS['TargetGain'],
                EDFA_PARAMS['TargetPower'],
                EDFA_PARAMS['ControlMode'],
                EDFA_PARAMS['CustomName'],
                EDFA_PARAMS['MaintenanceState'],
                EDFA_PARAMS['GainSwitchMode'],
                EDFA_PARAMS['TargetGainTilt'],
                EDFA_PARAMS['LosShutdown'],
                EDFA_PARAMS['OpticalLooThreshold'],
                EDFA_PARAMS['OpticalLooHysteresis'],
                EDFA_PARAMS['InputOverloadThreshold'],
                EDFA_PARAMS['InputOverloadHysteresis'],
                EDFA_PARAMS['InputLowDegradeThreshold'],
                EDFA_PARAMS['InputLowDegradeHysteresis'],
                EDFA_PARAMS['OpticalLosThreshold'],
                EDFA_PARAMS['OpticalLosHysteresis'],
                EDFA_PARAMS['OrlThresholdWarningThreshold'],
                EDFA_PARAMS['OrlThresholdWarningHysteresis'],
                EDFA_PARAMS['ForceApr'],
            ]
            
            preamplifier_config_params = [
                EDFA_PARAMS['TargetGain'],
                EDFA_PARAMS['TargetPower'],
                EDFA_PARAMS['ControlMode'],
                EDFA_PARAMS['CustomName'],
                EDFA_PARAMS['MaintenanceState'],
                EDFA_PARAMS['GainSwitchMode'],
                EDFA_PARAMS['TargetGainTilt'],
                EDFA_PARAMS['LosShutdown'],
                EDFA_PARAMS['OpticalLooThreshold'],
                EDFA_PARAMS['OpticalLooHysteresis'],
                EDFA_PARAMS['InputOverloadThreshold'],
                EDFA_PARAMS['InputOverloadHysteresis'],
                EDFA_PARAMS['ForceApr'],
            ]
            
            # Get booster operational config
            try:
                data = get_data(
                    device_credentials,
                    'edfa',
                    booster_config_params,
                    {'edfa': {'dn': 'ne=1;chassis=1;card=1;edfa=1'}},
                    device_id
                )
                
                timestamp = int(time.time() * 1000)   # epoch in ms
                for param, value in data.items():
                    if value is not None:
                        operational_config_redis.store_operational_config(
                            device_id,
                            'edfa-booster',
                            param,
                            value,
                            timestamp
                        )
            except Exception as e:
                logger.debug(f"Error polling booster operational config: {e}")
            
            # Get preamplifier operational config
            try:
                data = get_data(
                    device_credentials,
                    'edfa',
                    preamplifier_config_params,
                    {'edfa': {'dn': 'ne=1;chassis=1;card=1;edfa=2'}},
                    device_id
                )
                
                timestamp = int(time.time() * 1000)   # epoch in ms
                for param, value in data.items():
                    if value is not None:
                        operational_config_redis.store_operational_config(
                            device_id,
                            'edfa-preamplifier',
                            param,
                            value,
                            timestamp
                        )
            except Exception as e:
                logger.debug(f"Error polling preamplifier operational config: {e}")
            
            # Poll optical port operational configurations
            optical_port_config_params = [
                OPTICAL_PORT_PARAMS['CustomName'],
                OPTICAL_PORT_PARAMS['MaintenanceState'],
                OPTICAL_PORT_PARAMS['InputLowDegradeThreshold'],
                OPTICAL_PORT_PARAMS['InputLowDegradeHysteresis'],
                OPTICAL_PORT_PARAMS['OpticalLosThreshold'],
                OPTICAL_PORT_PARAMS['OpticalLosHysteresis'],
            ]
            
            # Poll MUX port configurations
            for port_number in MUX_OPTICAL_PORT_NUMBERS:
                try:
                    data = get_data(
                        device_credentials,
                        'optical-port',
                        optical_port_config_params,
                        {'physical-port': {'dn': f'ne=1;chassis=1;card=1;port={port_number}'}},
                        device_id
                    )
                    
                    timestamp = int(time.time() * 1000)   # epoch in ms
                    for param, value in data.items():
                        if value is not None:
                            operational_config_redis.store_operational_config(
                                device_id,
                                f'optical-port-mux-{port_number}',
                                param,
                                value,
                                timestamp
                            )
                except Exception as e:
                    logger.debug(f"Error polling MUX port {port_number} operational config: {e}")
            
            # Poll DEMUX port configurations
            for port_number in DEMUX_OPTICAL_PORT_NUMBERS:
                try:
                    data = get_data(
                        device_credentials,
                        'optical-port',
                        optical_port_config_params,
                        {'physical-port': {'dn': f'ne=1;chassis=1;card=1;port={port_number}'}},
                        device_id
                    )
                    
                    timestamp = int(time.time() * 1000)   # epoch in ms
                    for param, value in data.items():
                        if value is not None:
                            operational_config_redis.store_operational_config(
                                device_id,
                                f'optical-port-demux-{port_number}',
                                param,
                                value,
                                timestamp
                            )
                except Exception as e:
                    logger.debug(f"Error polling DEMUX port {port_number} operational config: {e}")
            
            logger.debug(f"Polled operational config for device {device_id}")
            
        except Exception as e:
            logger.error(f"Error polling operational config for device {device_id}: {e}")

# Global poller instance
device_poller = DeviceDataPoller() 