# import random

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils.data import ERROR_MESSAGES, cleanup_device_data
from .utils.generate_schema_dependencies import generate_schema_dependencies
from .utils.generate_schemas import generate_yang_schemas
from .utils.common import validate_device_operation
from .utils.redis_manager import monitoring_redis, running_config_redis, operational_config_redis
from .utils.background_poller import device_poller
from .utils.device_storage import get_all_devices, save_device, delete_device, get_device_by_id
import traceback

@api_view(['GET'])
def get_redis_keys(request):
    """Temporary endpoint to list all keys in monitoring Redis DB"""
    try:
        keys = monitoring_redis.redis_client.keys('*')
        return Response({"data": [k for k in keys]})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get Redis keys: {str(e)}"}}, status=500)

@api_view(['DELETE'])
def device_cleanup(request):
    try:
        device_id = request.data.get('deviceId')
        
        # Validate device ID
        is_valid, error_message = validate_device_operation(None, device_id)
        if not is_valid:
            return Response({"error": {"message": error_message}}, status=400)
        
        # Stop polling for this device
        device_poller.stop_polling(device_id)
        
        # Clean up device data from Redis
        monitoring_redis.cleanup_device_data(device_id)
        running_config_redis.cleanup_device_data(device_id)
        operational_config_redis.cleanup_device_data(device_id)
        
        # Clean up device data from legacy storage
        cleanup_device_data(device_id)
        return Response({"success": True, "message": f"Device {device_id} data cleaned up successfully"})
    except Exception as e:
        return Response({"error": {"message": f"Device cleanup failed: {str(e)}"}}, status=500)


@api_view(['PUT'])
def device_schema_dependencies(request):
    try:
        schemas = request.data['schemas']
        device_id = request.data.get('deviceId')
        
        # Validate device operation
        is_valid, error_message = validate_device_operation(None, device_id)
        if not is_valid:
            return Response({"error": {"message": error_message}}, status=400)
        
        generate_schema_dependencies(schemas, device_id)
        return Response({"success": True})
    except KeyError as e:
        return Response({"error": {"message": f"Missing required field: {str(e)}"}}, status=400)
    except Exception as e:
        return Response({"error": {"message": f"Schema dependencies error: {str(e)}"}}, status=500)


@api_view(['PUT'])
def device_schemas(request):
    try:
        schemas, credentials = request.data['schemas'], request.data['credentials']
        device_id = request.data.get('deviceId')
        
        # Validate device operation
        is_valid, error_message = validate_device_operation(credentials, device_id)
        if not is_valid:
            return Response({"error": {"message": error_message}}, status=400)
        
        generate_yang_schemas(schemas, credentials, device_id)
        return Response({"success": True})
    except KeyError as e:
        return Response({"error": {"message": f"Missing required field: {str(e)}"}}, status=400)
    except Exception as e:
        return Response({"error": {"message": f"Schema generation error: {str(e)}"}}, status=500)

        
def get_subrequests_array(request):
    # Accept list or dict; return empty list for None or unexpected types
    if request is None:
        return []
    if isinstance(request, list):
        # For list requests, ensure each item has a 'key' field
        return [item if 'key' in item else {**item, 'key': f'auto-key-{i}'} for i, item in enumerate(request)]
    if isinstance(request, dict):
        # For single dict requests, add a 'key' field
        return [{**request, 'key': 'only-key'}]
    # Unknown type -> return empty list
    return []

@api_view(['POST'])
def device_data(request):
    try:
        # A request can hold many sub_requests like getting data for
        # many components with different 'dn's
        request_body = request.data or {}
        device_credentials = request_body.get('device_credentials')
        data_params = request_body.get('data_params')
        device_id = request_body.get('deviceId')  # Extract device ID from request

        # Validate required fields
        if data_params is None:
            return Response({"error": {"message": "Missing required field: data_params"}}, status=400)
        
        # Validate device operation
        is_valid, error_message = validate_device_operation(device_credentials, device_id)
        if not is_valid:
            return Response({"error": {"message": error_message}}, status=400)
        
        # Start background polling for this device if not already polling
        device_poller.start_polling(device_id)
        
        # Check if original data_params was a single dict (not a list)
        is_single_request = type(data_params) == dict
        
        sub_requests = get_subrequests_array(data_params)
        # The responses list will hold response for each subrequest where each subrequest
        # is identified by a 'key'
        responses = []

        for sub_request in sub_requests:
            operation = sub_request.get('operation')
            component = sub_request.get('component')
            parameter = sub_request.get('parameter')
            query = sub_request.get('query')

            # Helper: build empty data object for parameter(s)
            def _empty_data_for_param(param):
                if isinstance(param, list):
                    return {p: None for p in param}
                return {param: None}

            # Basic validation
            if not operation or not component or parameter is None:
                key = sub_request.get('key', 'unknown')
                data_obj = _empty_data_for_param(parameter) if parameter is not None else {}
                # Always include a data object to avoid frontend runtime errors
                responses.append({"key": key, "data": data_obj, "error": {"message": "operation, component and parameter are required"}})
                if is_single_request:
                    return Response({"data": data_obj}, status=400)
                continue

            if operation == "config":
                # Forward config requests to edit_data (which handles device writes)
                try:
                    # Import edit_data lazily to avoid import-time dependency issues
                    from .utils.edit_data import edit_data
                    value = sub_request.get('value')
                    edit_data(device_credentials, component, parameter, value, query, device_id)
                    if is_single_request:
                        # For single request, return data shaped for parameter(s)
                        if isinstance(parameter, list):
                            # If caller provided dict of values, include them; else map each param to value
                            if isinstance(value, dict):
                                return Response({"data": {p: value.get(p) for p in parameter}})
                            return Response({"data": {p: value for p in parameter}})
                        return Response({"data": {parameter: value}})
                    # For batch or multi param, include a data object
                    if isinstance(parameter, list):
                        if isinstance(value, dict):
                            data_obj = {p: value.get(p) for p in parameter}
                        else:
                            data_obj = {p: value for p in parameter}
                    else:
                        data_obj = {parameter: value}
                    responses.append({"key": sub_request.get('key'), "success": True, "data": data_obj})
                except Exception as e:
                    err = {"message": f"Config operation failed: {str(e)}"}
                    data_obj = _empty_data_for_param(parameter)
                    if is_single_request:
                        return Response({"data": data_obj}, status=500)
                    responses.append({"key": sub_request.get('key'), "data": data_obj, "error": err})

            elif operation == "read":
                # Read ONLY from Redis (live mirror). Always return a data object so frontend can safely read properties.
                try:
                    # Support single-parameter and multi-parameter (list) requests
                    if isinstance(parameter, list):
                        batch = monitoring_redis.get_monitoring_data_batch(device_id, component, parameter)
                        data_obj = {}
                        for p in parameter:
                            pd = batch.get(p)
                            if pd and isinstance(pd, dict):
                                data_obj[p] = pd.get('value')
                            else:
                                data_obj[p] = None
                        if is_single_request:
                            return Response({"data": data_obj})
                        responses.append({"key": sub_request.get('key'), "data": data_obj})
                    else:
                        redis_data = monitoring_redis.get_monitoring_data(device_id, component, parameter)
                        value = None
                        timestamp = None
                        if redis_data and isinstance(redis_data, dict):
                            value = redis_data.get('value')
                            timestamp = redis_data.get('timestamp')

                        if is_single_request:
                            return Response({"data": {parameter: value}})

                        responses.append({"key": sub_request.get('key'), "data": {parameter: value, "timestamp": timestamp}})
                except Exception as e:
                    err = {"message": f"Redis read operation failed: {str(e)}"}
                    data_obj = _empty_data_for_param(parameter)
                    if is_single_request:
                        return Response({"data": data_obj}, status=500)
                    responses.append({"key": sub_request.get('key'), "data": data_obj, "error": err})

        return Response(responses)
    except KeyError as e:
        return Response({"error": {"message": f"Missing required field: {str(e)}"}}, status=400)
    except Exception as e:
        tb = traceback.format_exc()
        # Save traceback to file for debugging (temporary)
        try:
            with open(r"c:\Users\abeer\Documents\ROADM_Dashboard\ONE-FE\djangobackend\device_data_error.log", "w", encoding="utf-8") as f:
                f.write("Exception in device_data:\n")
                f.write(tb)
        except Exception:
            pass
        # Return generic message to client
        return Response({"error": {"message": f"Device data operation failed: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_monitoring_data(request):
    """Get monitoring data from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        component = request.GET.get('component')
        parameter = request.GET.get('parameter')
        port_type = request.GET.get('portType') # New: for grouped optical ports
        
        if not device_id:
            return Response({"error": {"message": "Missing required parameter: deviceId"}}, status=400)
      
        elif not component or not parameter:
            return Response({"error": {"message": "Missing required parameters: component, parameter"}}, status=400)
        else:
            # Handle grouped optical ports request: component may be 'optical-ports-mux' or 'optical-ports-demux' with parameter='grouped'
            if parameter == 'grouped' and component and component.startswith('optical-ports-'):
                # frontend sends portType='mux' or 'demux' for convenience
                port_type = component.replace('optical-ports-', '') if not port_type else port_type
                data = monitoring_redis.get_grouped_port_data(device_id, port_type)
            else:
                # Handle general monitoring data
                data = monitoring_redis.get_monitoring_data(device_id, component, parameter)

        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get monitoring data: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_timeseries_data(request):
    """Get historical time series data from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        component = request.GET.get('component')
        parameter = request.GET.get('parameter')
        count = int(request.GET.get('count', 100)) # Default to 100 data points

        if not device_id or not component or not parameter:
            return Response({"error": {"message": "Missing required parameters: deviceId, component, parameter"}}, status=400)

        data = monitoring_redis.get_timeseries_data(device_id, component, parameter, count)
        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get time series data: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_grouped_ports(request):
    """Return grouped mux/demux payload stored in Redis (values + timestamp)."""
    try:
        device_id = request.GET.get('deviceId')
        port_type = request.GET.get('portType')  # 'mux' or 'demux'
        if not device_id or not port_type:
            return Response({"error": {"message": "Missing required parameters: deviceId, portType"}}, status=400)

        data = monitoring_redis.get_grouped_port_data(device_id, port_type)
        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get grouped port data: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_grouped_parameter(request):
    """Return a mapping of portNumber -> parameter value for grouped mux/demux data.

    Query params: deviceId, portType (mux|demux), parameter (e.g., InputPower)
    """
    try:
        device_id = request.GET.get('deviceId')
        port_type = request.GET.get('portType')
        parameter = request.GET.get('parameter')
        if not device_id or not port_type or not parameter:
            return Response({"error": {"message": "Missing required parameters: deviceId, portType, parameter"}}, status=400)

        grouped = monitoring_redis.get_grouped_port_data(device_id, port_type)
        if not grouped:
            return Response({"data": {}})

        values = grouped.get('values') or {}
        result = {port: (vals.get(parameter) if isinstance(vals, dict) else None) for port, vals in values.items()}
        return Response({"data": result})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get grouped parameter data: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_running_config(request):
    """Get running configuration from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        component = request.GET.get('component')
        parameter = request.GET.get('parameter')
        
        if not device_id or not component or not parameter:
            return Response({"error": {"message": "Missing required parameters: deviceId, component, parameter"}}, status=400)
        
        data = running_config_redis.get_running_config(device_id, component, parameter)
        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get running config: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_operational_config(request):
    """Get operational configuration from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        component = request.GET.get('component')
        parameter = request.GET.get('parameter')
        
        if not device_id or not component or not parameter:
            return Response({"error": {"message": "Missing required parameters: deviceId, component, parameter"}}, status=400)
        
        data = operational_config_redis.get_operational_config(device_id, component, parameter)
        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get operational config: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_device_status(request):
    """Get device status and data freshness from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        
        if not device_id:
            return Response({"error": {"message": "Missing required parameter: deviceId"}}, status=400)
        
        status = monitoring_redis.get_device_status(device_id)
        return Response({"data": status})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get device status: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_device_summary(request):
    """Get comprehensive device summary from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        
        if not device_id:
            return Response({"error": {"message": "Missing required parameter: deviceId"}}, status=400)
        
        summary = monitoring_redis.get_device_summary(device_id)
        return Response({"data": summary})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get device summary: {str(e)}"}}, status=500)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def device_management(request):
    """Device management endpoint"""
    try:
        if request.method == 'GET':
            # Get all devices
            devices = get_all_devices()
            return Response({"data": devices})
        
        elif request.method == 'POST':
            # Add new device
            device_data = request.data
            device_id = device_data.get('id')
            
            if not device_id:
                return Response({"error": {"message": "Missing device ID"}}, status=400)
            
            if save_device(device_id, device_data):
                return Response({"success": True, "message": f"Device {device_id} added successfully"})
            else:
                return Response({"error": {"message": "Failed to add device"}}, status=500)
        
        elif request.method == 'PUT':
            # Update device
            device_data = request.data
            device_id = device_data.get('id')
            
            if not device_id:
                return Response({"error": {"message": "Missing device ID"}}, status=400)
            
            if save_device(device_id, device_data):
                return Response({"success": True, "message": f"Device {device_id} updated successfully"})
            else:
                return Response({"error": {"message": "Failed to update device"}}, status=500)
        
        elif request.method == 'DELETE':
            # Delete device
            device_id = request.data.get('deviceId')
            
            if not device_id:
                return Response({"error": {"message": "Missing device ID"}}, status=400)
            
            if delete_device(device_id):
                return Response({"success": True, "message": f"Device {device_id} deleted successfully"})
            else:
                return Response({"error": {"message": "Failed to delete device"}}, status=500)
    
    except Exception as e:
        return Response({"error": {"message": f"Device management failed: {str(e)}"}}, status=500)