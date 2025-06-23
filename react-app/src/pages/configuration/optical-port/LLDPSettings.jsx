import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

function LLDPSettings() {
  return (
    <Box mt={2} mb={2}>
      <Typography variant='h6'>LLDP</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <Grid item xs={12}>
            <Box>
              <FormControlLabel
                disabled
                label='Enabled'
                control={<Checkbox />}
              />
              <FormControlLabel
                label='Remote System Detected'
                control={<Checkbox />}
                disabled
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField size='small' label='Remote Port ID' fullWidth disabled />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Remote System Name'
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Remote Port Description'
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Remote Management Address'
              fullWidth
              disabled
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default LLDPSettings;
