import { Box, Grid } from '@mui/material';
import Layout from '../common-components/Layout';
import BoosterChart from './booster-chart/BoosterChart';
import DemuxChart from './demux-chart/DemuxChart';
import MuxChart from './mux-chart/MuxChart';
import PreamplifierChart from './preamplifier-chart/PreamplifierChart';

const Home = () => {
  return (
    <Layout requireDevice={true}>
      <Box sx={{ display: 'flex', padding: '20px', gap: '20px' }}></Box>

      <Grid
        container
        spacing={2}
        sx={{
          padding: '5px 20px',
        }}
      >
        <Grid item xs={12} md={6}>
          <BoosterChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <PreamplifierChart />
        </Grid>

        <Grid item xs={12} md={6}>
          <MuxChart />
        </Grid>

        <Grid item xs={12} md={6}>
          <DemuxChart />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;
