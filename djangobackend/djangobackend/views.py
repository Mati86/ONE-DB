# import random

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils.data import ERROR_MESSAGES
from .utils.edit_data import edit_data
from .utils.generate_schema_dependencies import generate_schema_dependencies
from .utils.generate_schemas import generate_yang_schemas
from .utils.get_data import get_data


@api_view(['PUT'])
def device_schema_dependencies(request):
    schemas = request.data['schemas']
    generate_schema_dependencies(schemas)
    return Response({"success": True})


@api_view(['PUT'])
def device_schemas(request):
    schemas, credentials = request.data['schemas'], request.data['credentials']
    generate_yang_schemas(schemas, credentials)
    return Response({"success": True})


def get_subrequests_array(request):
    if type(request) == list:
        return request
    if type(request) == dict:
        request['key'] = 'only-key'
        return [request]


@api_view(['POST'])
def device_data(request):
    # A request can hold many sub_requests like getting data for
    # many components with different 'dn's
    request_body = request.data
    device_credentials, data_params = request_body['device_credentials'], request_body["data_params"]
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
                          parameter, sub_request['value'], query)
                if type(data_params) == dict:
                    return Response({"data": {"success": True}})
                responses.append(
                    {"key": sub_request['key'], "data": {"success": True}})
            except Exception as e:
                return Response({"error": {"message": ERROR_MESSAGES["ServerError"]}}, status=500)
        if (operation == "read"):
            try:
                data = get_data(device_credentials,
                                component, parameter, query)
                if type(data_params) == dict:
                    return Response({"data": data})
                responses.append({"key": sub_request['key'], "data": data})
            except Exception as e:
                return Response({"error": {"message": ERROR_MESSAGES["ServerError"]}}, status=500)

    return Response(responses)
