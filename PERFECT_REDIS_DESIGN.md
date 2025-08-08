# Perfect Redis Database Design for ROADM Dashboard

## **Complete System Analysis**

After analyzing your entire frontend codebase, here's the perfect Redis database design that handles all your monitoring and configuration requirements:

## **Device Structure**
- **Multiple Devices**: Each device has unique ID, credentials, and refresh interval
- **Device Components**: EDFA (Booster/Preamplifier), Optical Ports (MUX/DEMUX)
- **Port Ranges**: MUX (4101-4120), DEMUX (5201-5220)

## **Redis Database Architecture**

### **Database 0: Monitoring Data (Real-time Device Parameters)**
Store current device parameters with timestamps for monitoring dashboards.

**Key Structure:**
```
device:{deviceId}:monitoring:{component}:{parameter}
```

**Examples:**
```
device:device1:monitoring:edfa-booster:input-power = "{"value": "-15.2", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:output-power = "{"value": "5.8", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:measured-gain = "{"value": "20.5", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:back-reflection-power = "{"value": "-45.2", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:optical-return-loss = "{"value": "35.8", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:als-disabled-seconds-remaining = "{"value": "0", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:entity-description = "{"value": "Booster EDFA", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-booster:operational-state = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z"}"

device:device1:monitoring:edfa-preamplifier:input-power = "{"value": "-25.1", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-preamplifier:output-power = "{"value": "-5.2", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-preamplifier:measured-gain = "{"value": "19.9", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-preamplifier:entity-description = "{"value": "Preamplifier EDFA", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:edfa-preamplifier:operational-state = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z"}"

device:device1:monitoring:optical-port-mux-4101:input-power = "{"value": "-12.1", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-mux-4101:output-power = "{"value": "2.3", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-mux-4101:entity-description = "{"value": "MUX Port 4101", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-mux-4101:operational-state = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z"}"

device:device1:monitoring:optical-port-demux-5201:input-power = "{"value": "-8.5", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-demux-5201:output-power = "{"value": "-2.1", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-demux-5201:entity-description = "{"value": "DEMUX Port 5201", "timestamp": "2024-01-15T10:30:45Z"}"
device:device1:monitoring:optical-port-demux-5201:operational-state = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z"}"
```

**Time Series Data (for charts):**
```
device:{deviceId}:timeseries:{component}:{parameter}
```
Using Redis Sorted Sets with timestamps as scores.

### **Database 1: Running Configuration (User-set Configurations)**
Store the current running configuration that users set through the frontend.

**Key Structure:**
```
device:{deviceId}:running:{component}:{parameter}
```

**Examples:**
```
device:device1:running:edfa-booster:target-gain = "{"value": "20.5", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:target-power = "{"value": "6.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:control-mode = "{"value": "automatic", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:custom-name = "{"value": "Main Booster", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:gain-switch-mode = "{"value": "enabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:target-gain-tilt = "{"value": "0.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:los-shutdown = "{"value": "enabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:optical-loo-threshold = "{"value": "-30.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:optical-loo-hysteresis = "{"value": "2.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:input-overload-threshold = "{"value": "-5.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:input-overload-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:orl-threshold-warning-threshold = "{"value": "15.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:orl-threshold-warning-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-booster:force-apr = "{"value": "disabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"

device:device1:running:edfa-preamplifier:target-gain = "{"value": "20.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:target-power = "{"value": "-5.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:control-mode = "{"value": "automatic", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:custom-name = "{"value": "Main Preamp", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:gain-switch-mode = "{"value": "enabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:target-gain-tilt = "{"value": "0.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:los-shutdown = "{"value": "enabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:optical-loo-threshold = "{"value": "-30.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:optical-loo-hysteresis = "{"value": "2.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:input-overload-threshold = "{"value": "-5.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:input-overload-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:edfa-preamplifier:force-apr = "{"value": "disabled", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"

device:device1:running:optical-port-mux-4101:custom-name = "{"value": "MUX_IN_1", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-mux-4101:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-mux-4101:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-mux-4101:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-mux-4101:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-mux-4101:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"

device:device1:running:optical-port-demux-5201:custom-name = "{"value": "DEMUX_OUT_1", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-demux-5201:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-demux-5201:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-demux-5201:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-demux-5201:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
device:device1:running:optical-port-demux-5201:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:25:30Z", "user": "admin"}"
```

### **Database 2: Operational Configuration (Device Actual Configurations)**
Store the actual operational configuration retrieved from devices.

**Key Structure:**
```
device:{deviceId}:operational:{component}:{parameter}
```

**Examples:**
```
device:device1:operational:edfa-booster:target-gain = "{"value": "20.5", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:target-power = "{"value": "6.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:control-mode = "{"value": "automatic", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:custom-name = "{"value": "Main Booster", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:gain-switch-mode = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:target-gain-tilt = "{"value": "0.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:los-shutdown = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:optical-loo-threshold = "{"value": "-30.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:optical-loo-hysteresis = "{"value": "2.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:input-overload-threshold = "{"value": "-5.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:input-overload-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:orl-threshold-warning-threshold = "{"value": "15.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:orl-threshold-warning-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-booster:force-apr = "{"value": "disabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"

device:device1:operational:edfa-preamplifier:target-gain = "{"value": "20.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:target-power = "{"value": "-5.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:control-mode = "{"value": "automatic", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:custom-name = "{"value": "Main Preamp", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:gain-switch-mode = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:target-gain-tilt = "{"value": "0.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:los-shutdown = "{"value": "enabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:optical-loo-threshold = "{"value": "-30.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:optical-loo-hysteresis = "{"value": "2.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:input-overload-threshold = "{"value": "-5.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:input-overload-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:edfa-preamplifier:force-apr = "{"value": "disabled", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"

device:device1:operational:optical-port-mux-4101:custom-name = "{"value": "MUX_IN_1", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-mux-4101:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-mux-4101:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-mux-4101:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-mux-4101:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-mux-4101:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"

device:device1:operational:optical-port-demux-5201:custom-name = "{"value": "DEMUX_OUT_1", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-demux-5201:maintenance-state = "{"value": "in-service", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-demux-5201:input-low-degrade-threshold = "{"value": "-35.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-demux-5201:input-low-degrade-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-demux-5201:optical-los-threshold = "{"value": "-40.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
device:device1:operational:optical-port-demux-5201:optical-los-hysteresis = "{"value": "1.0", "timestamp": "2024-01-15T10:30:45Z", "source": "device"}"
```

## **Complete Parameter Mapping**

### **EDFA Booster Monitoring Parameters (8):**
1. `input-power` - Input power in dBm
2. `output-power` - Output power in dBm  
3. `measured-gain` - Measured gain in dB
4. `back-reflection-power` - Back reflection power in dBm
5. `optical-return-loss` - Optical return loss in dB
6. `als-disabled-seconds-remaining` - ALS disabled seconds remaining
7. `entity-description` - Entity description
8. `operational-state` - Operational state

### **EDFA Preamplifier Monitoring Parameters (5):**
1. `input-power` - Input power in dBm
2. `output-power` - Output power in dBm
3. `measured-gain` - Measured gain in dB
4. `entity-description` - Entity description
5. `operational-state` - Operational state

### **EDFA Booster Configuration Parameters (19):**
1. `target-gain` - Target gain in dB
2. `target-power` - Target power in dBm
3. `control-mode` - Control mode (automatic/manual)
4. `custom-name` - Custom name
5. `maintenance-state` - Maintenance state (in-service/out-of-service)
6. `gain-switch-mode` - Gain switch mode
7. `target-gain-tilt` - Target gain tilt
8. `los-shutdown` - LOS shutdown
9. `optical-loo-threshold` - Optical LOO threshold
10. `optical-loo-hysteresis` - Optical LOO hysteresis
11. `input-overload-threshold` - Input overload threshold
12. `input-overload-hysteresis` - Input overload hysteresis
13. `input-low-degrade-threshold` - Input low degrade threshold
14. `input-low-degrade-hysteresis` - Input low degrade hysteresis
15. `optical-los-threshold` - Optical LOS threshold
16. `optical-los-hysteresis` - Optical LOS hysteresis
17. `orl-threshold-warning-threshold` - ORL threshold warning threshold
18. `orl-threshold-warning-hysteresis` - ORL threshold warning hysteresis
19. `force-apr` - Force APR

### **EDFA Preamplifier Configuration Parameters (13):**
1. `target-gain` - Target gain in dB
2. `target-power` - Target power in dBm
3. `control-mode` - Control mode (automatic/manual)
4. `custom-name` - Custom name
5. `maintenance-state` - Maintenance state (in-service/out-of-service)
6. `gain-switch-mode` - Gain switch mode
7. `target-gain-tilt` - Target gain tilt
8. `los-shutdown` - LOS shutdown
9. `optical-loo-threshold` - Optical LOO threshold
10. `optical-loo-hysteresis` - Optical LOO hysteresis
11. `input-overload-threshold` - Input overload threshold
12. `input-overload-hysteresis` - Input overload hysteresis
13. `force-apr` - Force APR

### **Optical Port Monitoring Parameters (4 per port):**
1. `input-power` - Input power in dBm
2. `output-power` - Output power in dBm
3. `entity-description` - Entity description
4. `operational-state` - Operational state

### **Optical Port Configuration Parameters (6 per port):**
1. `custom-name` - Custom name
2. `maintenance-state` - Maintenance state (in-service/out-of-service)
3. `input-low-degrade-threshold` - Input low degrade threshold
4. `input-low-degrade-hysteresis` - Input low degrade hysteresis
5. `optical-los-threshold` - Optical LOS threshold
6. `optical-los-hysteresis` - Optical LOS hysteresis

## **Port Coverage**

### **Multiplexer Ports (20):**
- 4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108, 4109, 4110
- 4111, 4112, 4113, 4114, 4115, 4116, 4117, 4118, 4119, 4120

### **Demultiplexer Ports (20):**
- 5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208, 5209, 5210
- 5211, 5212, 5213, 5214, 5215, 5216, 5217, 5218, 5219, 5220

## **Data Polling Strategy**

### **Automatic Polling Every 5 Seconds:**
1. **EDFA Components**: Booster and Preamplifier monitoring + configuration
2. **All Optical Ports**: All 40 ports (20 MUX + 20 DEMUX) monitoring + configuration
3. **Timestamp Storage**: Every data point stored with current timestamp
4. **Historical Data**: Time-series data for charts and analysis

### **Data Flow:**
1. **Background Poller**: Continuously polls all devices every 5 seconds
2. **Redis Storage**: Stores data in appropriate database with timestamps
3. **Frontend Requests**: Served from Redis cache first, fallback to device
4. **Configuration Management**: User configs vs device configs tracked separately

## **API Endpoints**

### **Monitoring Data:**
- `GET /api/redis/monitoring?deviceId={id}&component={comp}&parameter={param}`

### **Configuration Data:**
- `GET /api/redis/running_config?deviceId={id}&component={comp}&parameter={param}`
- `GET /api/redis/operational_config?deviceId={id}&component={comp}&parameter={param}`

### **Device Status:**
- `GET /api/redis/device_status?deviceId={id}`
- `GET /api/redis/device_summary?deviceId={id}`

### **Enhanced Existing:**
- `POST /api/data` - Serves from Redis cache first
- `DELETE /api/device_cleanup` - Cleans up Redis data

## **Benefits of This Design**

1. **Complete Coverage**: All devices, all components, all parameters
2. **Real-time Performance**: 5-second polling with Redis caching
3. **Historical Data**: Time-series data for charts and analysis
4. **Configuration Tracking**: Compare user intent vs device reality
5. **Scalability**: Efficient multi-device support
6. **Reliability**: Reduced load on network devices
7. **Flexibility**: Easy to add new devices and parameters

This design perfectly matches your frontend requirements and provides comprehensive monitoring and configuration management for your ROADM dashboard! 