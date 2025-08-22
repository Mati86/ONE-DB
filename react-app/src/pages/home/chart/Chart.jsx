import { Box, Typography } from '@mui/material';
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function Chart({ aspect, title, data, XInterval, dataKeys, YAxisDomain }) {
  return (
    <Box
      sx={{
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        padding: '10px',
      }}
    >
      <Typography variant='h6' sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer aspect={aspect}>
        <LineChart data={data}>
          {dataKeys.map(dataKey => (
            <Line
              key={dataKey.name}
              type='monotone'
              dataKey={dataKey.name}
              stroke={dataKey.color}
            />
          ))}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
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
