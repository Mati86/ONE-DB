import { Box } from '@mui/material';
import { PORT_TYPE } from '../../../../utils/data';
import Layout from '../../../common-components/Layout';
import PortsTable from '../../multiplexer/multiplexer-ports/PortsTable';

function DemultiplexerPorts() {
  return (
    <Layout requireDevice={true}>
      <Box sx={{ padding: 5 }}>
        <Box>
          <PortsTable portType={PORT_TYPE.Demultiplexer} />
        </Box>
      </Box>
    </Layout>
  );
}

export default DemultiplexerPorts;
