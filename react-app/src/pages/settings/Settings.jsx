import {
  Box,
  Button,
  FormLabel,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useMemo, useRef } from 'react';
import { notifySuccess } from '../../utils/utils';
import Navbar from '../common-components/navbar/Navbar';
import Sidebar from '../common-components/sidebar/Sidebar';

function Settings() {
  const inputRef = useRef();

  function handleClick(e) {
    localStorage.setItem(
      'dataRefreshInterval',
      parseInt(inputRef.current.value) * 1000
    );
    notifySuccess('Refresh Interval Updated');
  }

  const dataRefreshInterval = useMemo(() => {
    const locallyStoredDataRefreshInterval =
      localStorage.getItem('dataRefreshInterval') ?? 3000;
    return locallyStoredDataRefreshInterval / 1000;
  }, []);

  return (
    <Box display='flex'>
      <Sidebar />
      <Box sx={{ flex: 6 }}>
        <Navbar />
        <Box sx={{ padding: 5 }}>
          <Box>
            <FormLabel> Data Refresh Interval</FormLabel>
            <TextField
              // fullWidth
              sx={{ display: 'block', mt: 1 }}
              inputRef={inputRef}
              type='number'
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              size='small'
              defaultValue={dataRefreshInterval}
              InputProps={{
                endAdornment: <InputAdornment>s</InputAdornment>,
              }}
            />
          </Box>
          <Button
            sx={{ marginTop: 2 }}
            variant='contained'
            onClick={handleClick}
          >
            Save{' '}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Settings;
