import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { getCurrentDeviceId } from '../../utils/utils';

function DeviceGuard({ children }) {
  const currentDeviceId = getCurrentDeviceId();

  if (!currentDeviceId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          No Device Selected
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Please select a device from the navbar or configure a new device in the admin panel.
        </Typography>
        <Button
          component={Link}
          to="/admin"
          variant="contained"
          color="primary"
        >
          Go to Admin Panel
        </Button>
      </Box>
    );
  }

  return children;
}

export default DeviceGuard;
