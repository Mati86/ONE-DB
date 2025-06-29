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
]
