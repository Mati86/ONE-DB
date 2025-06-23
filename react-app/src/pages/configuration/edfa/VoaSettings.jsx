import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

function VoaSettings() {
  return (
    <Box my={2}>
      <Typography variant='h6'>VOAs</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='VOA Input Power'
              type='number'
              fullWidth
              value={2}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>dBm</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='VOA Output Power'
              type='number'
              fullWidth
              value={-11}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>dBm</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='VOA Attenuation'
              type='number'
              fullWidth
              value={1}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>dB</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default VoaSettings;
