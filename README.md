# ROADM Dashboard

A comprehensive dashboard for ROADM (Reconfigurable Optical Add-Drop Multiplexer) device management, monitoring, and configuration.

## Features

- Real-time device monitoring
- Configuration management
- EDFA (Erbium-Doped Fiber Amplifier) control
- Optical port management
- Historical data visualization
- Redis-based caching system

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start Redis with GUI using Docker:**
   ```bash
   # Windows
   start-redis-docker.bat
   
   # Linux/Mac
   docker-compose up -d
   ```

2. **Access Redis GUI:**
   - Open your browser and go to: http://localhost:8081
   - This provides a web interface to view and manage Redis data

3. **Start Django Backend:**
   ```bash
   cd ONE-FE/djangobackend
   pip install -r requirements.txt
   python manage.py runserver
   ```

4. **Start React Frontend:**
   ```bash
   cd ONE-FE/react-app
   npm install
   npm start
   ```

### Option 2: Manual Installation

1. **Install Redis Server:**
   ```bash
   # Windows: Download from https://github.com/microsoftarchive/redis/releases
   # Linux: sudo apt-get install redis-server
   # macOS: brew install redis
   ```

2. **Start Redis Server:**
   ```bash
   redis-server
   ```

3. **Install Python Dependencies:**
   ```bash
   cd ONE-FE/djangobackend
   pip install -r requirements.txt
   ```

4. **Start Django Backend:**
   ```bash
   python manage.py runserver
   ```

5. **Start React Frontend:**
   ```bash
   cd ONE-FE/react-app
   npm install
   npm start
   ```

## Redis Integration

The project uses Redis for real-time data caching and configuration management:

- **Database 0**: Monitoring data (real-time device parameters)
- **Database 1**: Running configuration (user-set configurations)
- **Database 2**: Operational configuration (device actual configurations)

### Redis GUI Access

When using Docker, you can access the Redis GUI at: http://localhost:8081

This allows you to:
- View all Redis databases and keys
- Monitor real-time data
- Inspect configuration values
- Debug data flow

## Project Structure

```
ONE-FE/
├── djangobackend/          # Django REST API backend
├── react-app/              # React frontend
├── docker-compose.yml      # Docker setup for Redis
├── start-redis-docker.bat  # Windows script to start Redis
└── README.md
```

## API Endpoints

### Device Management
- `POST /api/data` - Read/configure device data
- `DELETE /api/device_cleanup` - Clean up device data
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Add new device
- `PUT /api/devices` - Update device
- `DELETE /api/devices` - Delete device

### Redis Data Access
- `GET /api/redis/monitoring` - Get monitoring data from Redis
- `GET /api/redis/running_config` - Get running configuration from Redis
- `GET /api/redis/operational_config` - Get operational configuration from Redis
- `GET /api/redis/device_status` - Get device status from Redis
- `GET /api/redis/device_summary` - Get comprehensive device summary

## Configuration

The system automatically:
- Polls device data every 5 seconds
- Stores monitoring data in Redis DB 0
- Stores user configurations in Redis DB 1
- Stores device configurations in Redis DB 2
- Serves frontend requests from Redis cache first

## Troubleshooting

### Redis Connection Issues
1. Ensure Redis is running: `redis-cli ping`
2. Check Docker containers: `docker ps`
3. Verify Redis GUI is accessible at http://localhost:8081

### Device Connection Issues
1. Check device credentials in the admin panel
2. Verify network connectivity to devices
3. Check Django logs for connection errors

### Frontend Issues
1. Ensure backend is running on port 8000
2. Check browser console for API errors
3. Verify Redis data is being populated

## Development

### Adding New Device Parameters
1. Update constants in `react-app/src/utils/data.js`
2. Add polling logic in `djangobackend/utils/background_poller.py`
3. Update Redis key structures in `djangobackend/utils/redis_manager.py`

### Modifying Configuration Forms
1. Update form components in `react-app/src/pages/configuration/`
2. Ensure Redis loading logic is implemented
3. Test configuration persistence after page refresh

## License

This project is proprietary and confidential.
