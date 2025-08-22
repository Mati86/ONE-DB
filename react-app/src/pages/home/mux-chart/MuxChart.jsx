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
import { MUX_OPTICAL_PORT_NUMBERS, OPTICAL_PORT_PARAMS } from '../../../utils/data';
import { getApiPayloadForDeviceData, getDataParamsForPort, getCurrentDeviceId } from '../../../utils/utils';

function getApiPayload(portNumbers) {
  const currentDeviceId = getCurrentDeviceId();
  return getApiPayloadForDeviceData(
    portNumbers.map(portNumber => ({
      key: portNumber,
      ...getDataParamsForPort(portNumber, [OPTICAL_PORT_PARAMS.InputPower, OPTICAL_PORT_PARAMS.OutputPower]), // Added OutputPower
    })),
    currentDeviceId
  );
}

function MuxChart() {
  const [selectedPortNumbers, setSelectedPortNumbers] = useState(['4101']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const pollInterval = 5000; // Ensure this matches your polling interval
  const currentDeviceId = getCurrentDeviceId();

  const apiPayload = useMemo(() => {
    if (!currentDeviceId) return null;
    return getApiPayload(selectedPortNumbers);
  }, [selectedPortNumbers, currentDeviceId]);

  const apiData = useApiPoll(pollInterval, apiPayload);

  useEffect(() => {
    console.log('API Data:', apiData); // Log the API data for debugging
    if (apiData) {
    setCurrentData(prev => {
  const newDataPoint = { name: (prev.length * (pollInterval / 1000)).toString() };

  selectedPortNumbers.forEach(portNumber => {
    newDataPoint[portNumber] = {
      input: apiData[portNumber]?.InputPower ?? null,
      output: apiData[portNumber]?.OutputPower ?? null,
    };
  });

  return [newDataPoint, ...prev].slice(0, 7);
});

    }
  }, [apiData, pollInterval, selectedPortNumbers]);

 const chartLines = useMemo(() => {
  if (!currentData.length) return null;
  const lines = [];

  selectedPortNumbers.forEach(portNumber => {
    lines.push(
      <Line key={`${portNumber}-input`} dataKey={`${portNumber}.input`} stroke='green' name={`${portNumber} Input`} />
    );
    lines.push(
      <Line key={`${portNumber}-output`} dataKey={`${portNumber}.output`} stroke='blue' name={`${portNumber} Output`} />
    );
  });

  return lines;
}, [currentData, selectedPortNumbers]);


  return (
    <Box sx={{ boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)', padding: '10px' }}>
      <Typography variant='h6' sx={{ mb: 1, textAlign: 'center' }}>Multiplexer Power</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id='select-port'>Ports</InputLabel>
        <Select
          labelId='select-port'
          fullWidth
          size='small'
          value={selectedPortNumbers}
          label='Ports'
          onChange={e => setSelectedPortNumbers(e.target.value)}
          multiple
          open={dropdownOpen} 
          onOpen={() => setDropdownOpen(true)} 
          onClose={() => setDropdownOpen(false)}
        >
          {MUX_OPTICAL_PORT_NUMBERS.map(portNumber => (
            <MenuItem key={portNumber} value={portNumber}>
              {portNumber}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ResponsiveContainer aspect={2 / 1}>
        <LineChart data={currentData} margin={{ top: 15, right: 30, left: 20, bottom: 5 }} height={320}>
          {chartLines}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
          <XAxis dataKey='name' domain={[0, (pollInterval / 1000) * 6]} type='number' tickCount={7}>
            <Label fontSize={12} value='Time' offset={0} position='insideBottom' />
          </XAxis>
          <YAxis domain={[-60, 20]} type='number' tickCount={6} />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default MuxChart;