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
  MUX_OPTICAL_PORT_NUMBERS,
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
      ...getDataParamsForPort(portNumber, [OPTICAL_PORT_PARAMS.InputPower]),
    }))
  );
}

function MuxChart() {
  const [selectedPortNumbers, setSelectedPortNumbers] = useState(['4101']);
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
            response.data[OPTICAL_PORT_PARAMS.InputPower];
        });
        newData.unshift({
          // name is displayed on x-axis
          name: '0',
          ...powerFormattedData,
        });
        // update the names
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            // name is displayed on x-axis
            name: (index * (pollInterval / 1000)).toString(),
          };
        });
      });
    }
  }, [apiData, pollInterval]);

  const chartLines = useMemo(() => {
    if (!currentData.length) return null;
    const filteredKeys = Object.keys(currentData[0]).filter(
      key => key !== 'name'
    );

    return filteredKeys.map(key => {
      return <Line key={key} type='monotone' dataKey={key} stroke='green' />;
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
        Multiplexer Power
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id='select-port'>Ports</InputLabel>
        <Select
          labelId='select-port'
          fullWidth
          size='small'
          value={selectedPortNumbers}
          label='Ports'
          onChange={handlePortNumbersChange}
          multiple
        >
          {MUX_OPTICAL_PORT_NUMBERS.map(portNumber => (
            <MenuItem key={portNumber} value={portNumber}>
              {portNumber}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ResponsiveContainer aspect={2 / 1}>
        <LineChart
          data={currentData ?? []}
          margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
          height={320}
        >
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

export default MuxChart;
