from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/data',
         views.device_data, name='device data'),
    path('api/device_schemas',
         views.device_schemas, name='device schemas'),
    path('api/device_schema_dependencies',
         views.device_schema_dependencies, name='device schema dependencies'),
    path('api/device_cleanup',
         views.device_cleanup, name='device cleanup'),
    path('api/redis/monitoring',
         views.redis_monitoring_data, name='redis monitoring data'),
    path('api/redis/running_config',
         views.redis_running_config, name='redis running config'),
    path('api/redis/operational_config',
         views.redis_operational_config, name='redis operational config'),
    path('api/redis/device_status',
         views.redis_device_status, name='redis device status'),
    path('api/redis/device_summary',
         views.redis_device_summary, name='redis device summary'),
    path('api/devices',
         views.device_management, name='device management'),
]
