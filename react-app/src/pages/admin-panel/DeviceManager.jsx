import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  addDevice,
  deleteDevice,
  getCurrentDeviceId,
  getDevices,
  notifySuccess,
  setCurrentDeviceId,
  updateDevice,
} from '../../utils/utils';

function DeviceManager({ onDeviceChange }) {
  const [devices, setDevices] = useState(getDevices());
  const [currentDevice, setCurrentDevice] = useState(getCurrentDeviceId());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    ip: '',
    port: 830,
    username: '',
    password: '',
    dataRefreshInterval: 3,
  });

  function handleAddDevice() {
    setEditingDevice(null);
    setDeviceForm({
      name: '',
      ip: '',
      port: 830,
      username: '',
      password: '',
      dataRefreshInterval: 3,
    });
    setDialogOpen(true);
  }

  function handleEditDevice(device) {
    setEditingDevice(device);
    setDeviceForm({
      name: device.name,
      ip: device.credentials.ip,
      port: device.credentials.port,
      username: device.credentials.username,
      password: device.credentials.password,
      dataRefreshInterval: device.dataRefreshInterval || 3,
    });
    setDialogOpen(true);
  }

  function handleDeleteDevice(deviceId) {
    if (window.confirm('Are you sure you want to delete this device?')) {
      deleteDevice(deviceId);
      const updatedDevices = getDevices();
      setDevices(updatedDevices);
      
      // If deleted device was current, clear selection
      if (currentDevice === deviceId) {
        setCurrentDevice('');
        setCurrentDeviceId('');
        onDeviceChange('');
      }
      
      notifySuccess('Device deleted successfully');
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setDeviceForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSaveDevice() {
    if (!deviceForm.name || !deviceForm.ip || !deviceForm.username || !deviceForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const deviceData = {
      name: deviceForm.name,
      credentials: {
        ip: deviceForm.ip,
        port: parseInt(deviceForm.port),
        username: deviceForm.username,
        password: deviceForm.password,
      },
      dataRefreshInterval: parseInt(deviceForm.dataRefreshInterval),
    };

    if (editingDevice) {
      // Update existing device
      updateDevice(editingDevice.id, deviceData);
      notifySuccess('Device updated successfully');
    } else {
      // Add new device
      const newDevice = {
        id: uuidv4(),
        ...deviceData,
      };
      addDevice(newDevice);
      notifySuccess('Device added successfully');
    }

    const updatedDevices = getDevices();
    setDevices(updatedDevices);
    setDialogOpen(false);
  }

  function handleCurrentDeviceChange(e) {
    const deviceId = e.target.value;
    setCurrentDevice(deviceId);
    setCurrentDeviceId(deviceId);
    onDeviceChange(deviceId);
  }

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 3 }}>
        Device Management
      </Typography>

      {/* Current Device Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Current Device
        </Typography>
        <Select
          value={currentDevice || ''}
          onChange={handleCurrentDeviceChange}
          displayEmpty
          fullWidth
          size='small'
        >
          <MenuItem value=''>
            <em>Select a device</em>
          </MenuItem>
          {devices.map(device => (
            <MenuItem key={device.id} value={device.id}>
              {device.name} ({device.credentials.ip})
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Device List */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>Devices</Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddDevice}
          >
            Add Device
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Refresh Interval</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map(device => (
                <TableRow key={device.id}>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.credentials.ip}</TableCell>
                  <TableCell>{device.credentials.port}</TableCell>
                  <TableCell>{device.credentials.username}</TableCell>
                  <TableCell>{device.dataRefreshInterval || 3}s</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditDevice(device)}
                      color='primary'
                      size='small'
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDevice(device.id)}
                      color='error'
                      size='small'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Device Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {editingDevice ? 'Edit Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name='name'
                label='Device Name'
                value={deviceForm.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                name='ip'
                label='IP Address'
                value={deviceForm.ip}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name='port'
                label='Port'
                type='number'
                value={deviceForm.port}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='username'
                label='Username'
                value={deviceForm.username}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='password'
                label='Password'
                type='password'
                value={deviceForm.password}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='dataRefreshInterval'
                label='Data Refresh Interval (seconds)'
                type='number'
                value={deviceForm.dataRefreshInterval}
                onChange={handleFormChange}
                fullWidth
                inputProps={{ min: 1, max: 60 }}
                helperText="How often to refresh data (1-60 seconds)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveDevice}
            variant='contained'
            startIcon={<SaveIcon />}
          >
            {editingDevice ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DeviceManager;
