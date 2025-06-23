import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import React from 'react';

function DeviceCredentialsForm({
  ip,
  port,
  username,
  password,
  onChange,
  onSave,
}) {
  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 3 }}>
        Device Credentials
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            sx={{ flexGrow: 1, display: 'block' }}
            name='ip'
            size='small'
            label='Device IP'
            fullWidth
            value={ip}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            sx={{ flexGrow: 1, display: 'block' }}
            name='port'
            size='small'
            label='Port'
            fullWidth
            value={port}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            sx={{ flexGrow: 1, display: 'block' }}
            name='username'
            size='small'
            label='Username'
            fullWidth
            value={username}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            sx={{ flexGrow: 1, display: 'block' }}
            name='password'
            size='small'
            label='Password'
            fullWidth
            value={password}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant='contained'
            sx={{ paddingX: '20px' }}
            endIcon={<SaveIcon />}
            onClick={onSave}
          >
            Save All
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DeviceCredentialsForm;
