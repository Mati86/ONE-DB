import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useApiPoll from '../../../hooks/useApiPoll';
import useDataPollInterval from '../../../hooks/useDataPollInterval';
import {
  DEMUX_OPTICAL_PORT_NUMBERS,
  OPTICAL_PORT_PARAMS,
} from '../../../utils/data';
import { getCurrentDeviceId } from '../../../utils/utils';

// Build Redis payload for Demux ports
function getRedisPayload(portNumbers) {
  return portNumbers.map(portNumber => ({
    key: portNumber,
    component: `optical-port-demux-${portNumber}`,
    parameter: OPTICAL_PORT_PARAMS.OutputPower,
  }));
}

function DemuxChart() {
  const [selectedPortNumbers, setSelectedPortNumbers] = useState(['5201']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  // keep UI identical: use static port list from data.js
  const pollInterval = useDataPollInterval();
  const currentDeviceId = getCurrentDeviceId();

  const redisPayload = useMemo(() => {
    if (!currentDeviceId) return null;
    return getRedisPayload(selectedPortNumbers);
  }, [selectedPortNumbers, currentDeviceId]);

  const apiData = useApiPoll(pollInterval, redisPayload);

  function handlePortNumbersChange(e) {
    setSelectedPortNumbers(e.target.value);
    setDropdownOpen(false);
  }

  useEffect(() => {
    if (apiData) {
      setCurrentData(prev => {
        let newData = [...prev];
        const powerFormattedData = {};
        apiData.forEach(response => {
          if (response.data) {
            powerFormattedData[response.key] = response.data[OPTICAL_PORT_PARAMS.OutputPower];
          }
        });
        newData.unshift({
          name: '0',
          ...powerFormattedData,
        });
        return newData.slice(0, 7).map((data, index) => ({
          ...data,
          name: (index * (pollInterval / 1000)).toString(),
        }));
      });
    }
  }, [apiData, pollInterval]);

  // no dynamic UI changes — integration handled in backend

  const chartLines = useMemo(() => {
    if (!currentData.length) return null;
    const filteredKeys = Object.keys(currentData[0]).filter(key => key !== 'name');
    return filteredKeys.map(key => (
      <Line key={key} type='monotone' dataKey={key} stroke='#8884d8' />
    ));
  }, [currentData]);

  return (
    <Box
      sx={{
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        padding: '10px',
      }}
    >
      <Typography variant='h6' sx={{ mb: 1, textAlign: 'center' }}>
        Demultiplexer Power
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id='select-port-demux'>Ports</InputLabel>
        <Select
          labelId='select-port-demux'
          fullWidth
          size='small'
          value={selectedPortNumbers}
          label='Ports'
          onChange={handlePortNumbersChange}
          multiple
          open={dropdownOpen}
          onOpen={() => setDropdownOpen(true)}
          onClose={() => setDropdownOpen(false)}
        >
            {DEMUX_OPTICAL_PORT_NUMBERS.map(portNumber => (
              <MenuItem key={portNumber} value={portNumber}>
                {portNumber}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <ResponsiveContainer aspect={2 / 1}>
        <LineChart data={currentData ?? []}>
          {chartLines}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
          <XAxis
            dataKey='name'
            domain={[0, (pollInterval / 1000) * 6]}
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
          <YAxis domain={[-60, 20]} type='number' tickCount={6} />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default DemuxChart;
