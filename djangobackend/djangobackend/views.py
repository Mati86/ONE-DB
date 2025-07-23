# import random

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils.data import ERROR_MESSAGES, cleanup_device_data
from .utils.edit_data import edit_data
from .utils.generate_schema_dependencies import generate_schema_dependencies
from .utils.generate_schemas import generate_yang_schemas
from .utils.get_data import get_data
from .utils.common import validate_device_operation


@api_view(['DELETE'])
def device_cleanup(request):
    try:
        device_id = request.data.get('deviceId')
        
        # Validate device ID
        is_valid, error_message = validate_device_operation(None, device_id)
        if not is_valid:
            return Response({"error": {"message": error_message}}, status=400)
        
        # Clean up device data
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
                    data = get_data(device_credentials,
                                    component, parameter, query, device_id)
                    if is_single_request:
                        return Response({"data": data})
                    responses.append({"key": sub_request['key'], "data": data})
                except Exception as e:
                    error_msg = f"Data retrieval operation failed: {str(e)}"
                    return Response({"error": {"message": error_msg}}, status=500)

        return Response(responses)
    except KeyError as e:
        return Response({"error": {"message": f"Missing required field: {str(e)}"}}, status=400)
    except Exception as e:
        return Response({"error": {"message": f"Device data operation failed: {str(e)}"}}, status=500)