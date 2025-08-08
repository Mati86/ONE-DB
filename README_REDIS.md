# Redis Integration for ROADM Dashboard

This document describes the Redis integration that has been added to the ROADM Dashboard project to provide real-time data caching and configuration management.

## Architecture Overview

The Redis integration uses **3 separate Redis databases**:

- **Database 0**: Monitoring Data (Real-time device parameters)
- **Database 1**: Running Configuration (User-set configurations)
- **Database 2**: Operational Configuration (Device actual configurations)

## Redis Key Structure

### Monitoring Data (DB 0)
```
device:{deviceId}:monitoring:{component}:{parameter}
```
**Examples:**
- `device:device1:monitoring:edfa-booster:input-power`
- `device:device1:monitoring:optical-port-mux-4101:input-power`
- `device:device1:monitoring:edfa-preamplifier:output-power`

### Running Configuration (DB 1)
```
device:{deviceId}:running:{component}:{parameter}
```
**Examples:**
- `device:device1:running:edfa-booster:target-gain`
- `device:device1:running:optical-port-mux-4101:custom-name`

### Operational Configuration (DB 2)
```
device:{deviceId}:operational:{component}:{parameter}
```
**Examples:**
- `device:device1:operational:edfa-booster:target-gain`
- `device:device1:operational:edfa-preamplifier:control-mode`

## Installation

### 1. Install Redis Server

**Windows:**
```bash
# Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
# Or use WSL2 with Ubuntu and install Redis there
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

### 2. Install Python Dependencies

```bash
cd ONE-FE/djangobackend
pip install -r requirements.txt
```

### 3. Start Redis Server

```bash
# Start Redis server
redis-server

# Or on Windows
redis-server.exe
```

### 4. Start Django Backend

```bash
cd ONE-FE/djangobackend
python manage.py runserver
```

### 5. Start React Frontend

```bash
cd ONE-FE/react-app
npm install
npm start
```

## How It Works

### Background Data Polling

1. **Automatic Polling**: When a device is selected, the backend automatically starts polling the device every 5 seconds
2. **Data Storage**: All device data is stored in Redis with timestamps
3. **Real-time Updates**: Frontend requests are served from Redis cache instead of direct device queries

### Configuration Management

1. **User Configuration**: When users set configurations via frontend, they're stored in Redis DB 1
2. **Device Configuration**: Actual device configurations are polled and stored in Redis DB 2
3. **Comparison**: Frontend can compare user-set vs device-actual configurations

### API Endpoints

#### New Redis-specific endpoints:

- `GET /api/redis/monitoring?deviceId={id}&component={comp}&parameter={param}`
- `GET /api/redis/running_config?deviceId={id}&component={comp}&parameter={param}`
- `GET /api/redis/operational_config?deviceId={id}&component={comp}&parameter={param}`
- `GET /api/redis/device_status?deviceId={id}`

#### Enhanced existing endpoints:

- `POST /api/data` - Now serves data from Redis cache first, falls back to device
- `DELETE /api/device_cleanup` - Now cleans up Redis data as well

## Configuration

### Django Settings

The Redis configuration is in `djangobackend/settings.py`:

```python
# Redis Configuration
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB_MONITORING = 0
REDIS_DB_RUNNING_CONFIG = 1
REDIS_DB_OPERATIONAL_CONFIG = 2

# Data Polling Interval (seconds)
DEVICE_DATA_POLL_INTERVAL = 5
```

### Polling Parameters

The background poller automatically polls:

**EDFA Components:**
- Input Power, Output Power, Measured Gain
- Back Reflection Power, Optical Return Loss
- Entity Description, Operational State

**Optical Ports:**
- Input/Output Power for MUX ports (4101-4105)
- Input/Output Power for DEMUX ports (5201-5205)

**Configuration Parameters:**
- Target Gain, Target Power, Control Mode
- Custom Name, Maintenance State

## Benefits

1. **Performance**: Faster response times for monitoring data
2. **Reliability**: Reduced load on network devices
3. **Historical Data**: Time-series data for charts and analysis
4. **Configuration Tracking**: Compare user intent vs device reality
5. **Scalability**: Can handle multiple devices efficiently

## Monitoring and Debugging

### Check Redis Data

```bash
# Connect to Redis CLI
redis-cli

# Switch to monitoring database
SELECT 0

# List all keys for a device
KEYS device:device1:monitoring:*

# Get specific data
GET device:device1:monitoring:edfa-booster:input-power

# Switch to running config database
SELECT 1

# Switch to operational config database
SELECT 2
```

### Django Logs

Check Django logs for polling status and Redis operations:

```bash
# In Django console
python manage.py shell

# Check device status
from djangobackend.utils.redis_manager import monitoring_redis
status = monitoring_redis.get_device_status('device1')
print(status)
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis server is running
   - Check Redis host/port in settings.py

2. **No Data in Redis**
   - Check if background polling is active
   - Verify device credentials are valid
   - Check Django logs for polling errors

3. **Frontend Not Getting Data**
   - Verify Redis API endpoints are accessible
   - Check browser network tab for API errors
   - Ensure device is selected in frontend

### Debug Commands

```bash
# Check Redis is running
redis-cli ping

# Check Django is connected to Redis
python manage.py shell
from djangobackend.utils.redis_manager import monitoring_redis
monitoring_redis.redis_client.ping()

# Check device polling status
from djangobackend.utils.background_poller import device_poller
print(device_poller.devices_to_poll)
print(device_poller.running)
```

## Future Enhancements

1. **Redis Cluster**: For high availability
2. **Data Retention**: Automatic cleanup of old data
3. **Alerts**: Redis-based alerting system
4. **Analytics**: Advanced analytics on historical data
5. **Multi-device**: Enhanced multi-device support 