import { Box, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import Chart from '../../common-components/Chart';

function EdfaMonitoredDataItem({
  name,
  value,
  monitoredData,
  dataKey,
  valueRange,
}) {
  const pollInterval = useDataPollInterval();
  const [openChart, setOpenChart] = useState(false);

  const toggleOpenChart = () => setOpenChart(prev => !prev);

  return (
    <Box sx={{ py: '12px' }}>
      <Grid
        container
        sx={{ alignItems: 'center', cursor: 'pointer' }}
        spacing={4}
        onClick={toggleOpenChart}
      >
        <Grid item xs={6} md={4}>
          <Typography sx={{ fontWeight: 'bold' }}>{name} :</Typography>
        </Grid>

        <Grid item xs={6} md={8}>
          <Typography>{value}</Typography>
        </Grid>
      </Grid>
      <>
        {monitoredData && openChart && (
          <Box sx={{ mt: 2, maxWidth: '700px' }}>
            <Chart
              dataKey={dataKey}
              title={name}
              data={monitoredData ?? []}
              aspect={2 / 1}
              XInterval={pollInterval / 1000}
              YAxisDomain={valueRange}
            />
          </Box>
        )}
      </>
    </Box>
  );
}

export default EdfaMonitoredDataItem;
