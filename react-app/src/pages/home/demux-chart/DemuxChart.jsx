import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { default as React, useEffect, useMemo, useState } from 'react';
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
import {
  getApiPayloadForDeviceData,
  getDataParamsForPort,
} from '../../../utils/utils';

function getApiPayload(portNumbers) {
  return getApiPayloadForDeviceData(
    portNumbers.map(portNumber => ({
      key: portNumber,
      ...getDataParamsForPort(portNumber, [OPTICAL_PORT_PARAMS.OutputPower]),
    }))
  );
}

function DemuxChart() {
  const [selectedPortNumbers, setSelectedPortNumbers] = useState(['5201']);
  const [currentData, setCurrentData] = useState([]);
  const pollInterval = useDataPollInterval();

  const apiPayload = useMemo(() => {
    return getApiPayload(selectedPortNumbers);
  }, [selectedPortNumbers]);

  const apiData = useApiPoll(pollInterval, apiPayload);

  function handlePortNumbersChange(e) {
    setSelectedPortNumbers(e.target.value);
  }

  useEffect(() => {
    if (apiData) {
      setCurrentData(prev => {
        let newData = [...prev];
        const powerFormattedData = {};
        apiData.forEach(response => {
          powerFormattedData[response.key] =
            response.data[OPTICAL_PORT_PARAMS.OutputPower];
        });
        newData.unshift({
          name: '0',
          ...powerFormattedData,
        });
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            name: (index * (pollInterval / 1000)).toString(),
          };
        });
      });
    }
  }, [apiData, pollInterval]);

  const chartLines = useMemo(() => {
    if (!currentData.length) return null;
    const filtered = Object.keys(currentData[0]).filter(key => key !== 'name');

    return filtered.map(key => {
      return <Line key={key} type='monotone' dataKey={key} stroke='#8884d8' />;
    });
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
        >
          {DEMUX_OPTICAL_PORT_NUMBERS.map(portName => (
            <MenuItem key={portName} value={portName}>
              {' '}
              {portName}{' '}
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
