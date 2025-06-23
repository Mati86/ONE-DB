import { Box, Typography } from '@mui/material';
import React from 'react';
import {
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function Chart({
  dataKey,
  aspect,
  title,
  XInterval,
  data,
  YAxisDomain = [-60, 60],
}) {
  return (
    <Box
      sx={{
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        padding: '10px',
      }}
    >
      <Typography variant='h6' sx={{ textAlign: 'center', fontSize: 16 }}>
        {title}
      </Typography>
      <ResponsiveContainer aspect={aspect}>
        <LineChart data={data}>
          <Line type='monotone' dataKey={dataKey} stroke='green' />
          <XAxis
            dataKey='name'
            domain={[0, XInterval * 6]}
            type='number'
            tickCount={7}
          >
            <Label
              fontSize={12}
              value='Time'
              offset={0}
              position='insideBottom'
            />
          </XAxis>
          <YAxis domain={YAxisDomain} type='number' tickCount={6} />
          <Tooltip />
          <Legend verticalAlign='top' wrapperStyle={{ fontSize: '12px' }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default Chart;
