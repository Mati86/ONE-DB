import { Box } from '@mui/material';
import { PORT_TYPE } from '../../../../utils/data';
import Layout from '../../../common-components/Layout';
import PortsTable from './PortsTable';

function MultiplexerPorts() {
  return (
    <Layout>
      <Box sx={{ padding: 5 }}>
        <Box>
          <PortsTable portType={PORT_TYPE.Multiplexer} />
        </Box>
      </Box>
    </Layout>
  );
}

export default MultiplexerPorts;
