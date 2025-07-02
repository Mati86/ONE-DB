import { Grid, InputAdornment, TextField } from '@mui/material';

function PowerAlarmSettingField({
  onChange,
  name,
  value,
  label,
  unit = 'dB',
}) {
  return (
    <Grid item xs={12} lg={6} display='flex'>
      <TextField
        size='small'
        label={label}
        name={name}
        value={value}
        type='number'
        fullWidth
        InputProps={{
          endAdornment: <InputAdornment>{unit}</InputAdornment>,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange}
      />
    </Grid>
  );
}

export default PowerAlarmSettingField;
