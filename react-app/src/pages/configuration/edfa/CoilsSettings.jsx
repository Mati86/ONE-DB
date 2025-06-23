import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

function CoilsSettings() {
  return (
    <Box my={2}>
      <Typography variant='h6'>Coils</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Erbium Temperature'
              type='number'
              fullWidth
              value={-11}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>&#x2103;</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default CoilsSettings;
