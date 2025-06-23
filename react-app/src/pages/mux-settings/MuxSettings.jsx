import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from '../common-components/navbar/Navbar';
import Sidebar from '../common-components/sidebar/Sidebar';

function MuxSettings() {
  return (
    <Box display='flex'>
      <Sidebar />
      <Box sx={{ flex: 6 }}>
        <Navbar />
        <Box p={4}>
          <Typography variant='h4' mb={2}>
            Mux Settings
          </Typography>
          <ButtonGroup variant='contained'>
            <Link
              to='/monitoring/multiplexer/ports'
              style={{ textDecoration: 'none' }}
            >
              <Button>Manage Ports</Button>
            </Link>
            <Link to='/' style={{ textDecoration: 'none' }}>
              <Button sx={{ ml: 2 }}>Manage Channels</Button>
            </Link>
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}

export default MuxSettings;
