import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

function PumpSettings() {
  return (
    <Box my={2}>
      <Typography variant='h6'>Pumps</Typography>
      <Box>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Pump Current'
              type='number'
              fullWidth
              value={2}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>A</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Pump Temperature'
              type='number'
              fullWidth
              value={-11}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>&#x2103;</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Tec Current'
              type='number'
              fullWidth
              value={2}
              disabled
              InputProps={{
                endAdornment: <InputAdornment>A</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              label='Tec Temperature'
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

export default PumpSettings;
