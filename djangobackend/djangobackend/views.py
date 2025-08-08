# import random

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils.data import ERROR_MESSAGES, cleanup_device_data
from .utils.edit_data import edit_data
from .utils.generate_schema_dependencies import generate_schema_dependencies
from .utils.generate_schemas import generate_yang_schemas
from .utils.get_data import get_data
from .utils.common import validate_device_operation
from .utils.redis_manager import monitoring_redis, running_config_redis, operational_config_redis
from .utils.background_poller import device_poller
from .utils.device_storage import get_all_devices, save_device, delete_device, get_device_by_id


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
    if type(request) == list:
        # For list requests, ensure each item has a 'key' field
        return [item if 'key' in item else {**item, 'key': f'auto-key-{i}'} for i, item in enumerate(request)]
    if type(request) == dict:
        # For single dict requests, add a 'key' field
        return [{**request, 'key': 'only-key'}]

@api_view(['POST'])
def device_data(request):
    try:
        # A request can hold many sub_requests like getting data for
        # many components with different 'dn's
        request_body = request.data
        device_credentials, data_params = request_body['device_credentials'], request_body["data_params"]
        device_id = request_body.get('deviceId')  # Extract device ID from request
        
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
            operation, component, parameter, query = sub_request['operation'], sub_request[
                'component'], sub_request['parameter'], sub_request['query']
            if (operation == "config"):
                try:
                    # Store configuration in Redis
                    user = request_body.get('user', 'admin')
                    running_config_redis.store_running_config(
                        device_id, component, parameter, sub_request['value'], user
                    )
                    
                    # Apply configuration to device
                    edit_data(device_credentials, component,
                              parameter, sub_request['value'], query, device_id)
                    if is_single_request:
                        return Response({"data": {"success": True}})
                    responses.append(
                        {"key": sub_request['key'], "data": {"success": True}})
                except Exception as e:
                    error_msg = f"Configuration operation failed: {str(e)}"
                    return Response({"error": {"message": error_msg}}, status=500)
            if (operation == "read"):
                try:
                    # Try to get data from Redis first
                    redis_data = monitoring_redis.get_monitoring_data(device_id, component, parameter)
                    
                    if redis_data:
                        # Return data from Redis
                        if is_single_request:
                            return Response({"data": {parameter: redis_data["value"]}})
                        responses.append({"key": sub_request['key'], "data": {parameter: redis_data["value"]}})
                    else:
                        # Fallback to direct device query
                        data = get_data(device_credentials,
                                        component, parameter, query, device_id)
                        if is_single_request:
                            return Response({"data": data})
                        responses.append({"key": sub_request['key'], "data": data})
                except Exception as e:
                    error_msg = f"Read operation failed: {str(e)}"
                    return Response({"error": {"message": error_msg}}, status=500)

        return Response(responses)
    except KeyError as e:
        return Response({"error": {"message": f"Missing required field: {str(e)}"}}, status=400)
    except Exception as e:
        return Response({"error": {"message": f"Device data operation failed: {str(e)}"}}, status=500)


@api_view(['GET'])
def redis_monitoring_data(request):
    """Get monitoring data from Redis"""
    try:
        device_id = request.GET.get('deviceId')
        component = request.GET.get('component')
        parameter = request.GET.get('parameter')
        
        if not device_id or not component or not parameter:
            return Response({"error": {"message": "Missing required parameters: deviceId, component, parameter"}}, status=400)
        
        data = monitoring_redis.get_monitoring_data(device_id, component, parameter)
        return Response({"data": data})
    except Exception as e:
        return Response({"error": {"message": f"Failed to get monitoring data: {str(e)}"}}, status=500)


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