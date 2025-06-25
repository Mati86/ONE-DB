import { Box, Button, TableCell, TableRow } from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useApiPoll from '../../../../hooks/useApiPoll';
import { OPTICAL_PORT_PARAMS, PORT_TYPE } from '../../../../utils/data';
import { getReadApiPayloadForPort } from '../../../../utils/utils';

function PortTableRow({ portNumber, portType }) {
  const location = useLocation();
  const isConfigurationRoute = location.pathname.startsWith('/configuration');
  const isMonitoringRoute = location.pathname.startsWith('/monitoring');
  
  const data = useApiPoll(
    10000,
    getReadApiPayloadForPort(portNumber, [
      OPTICAL_PORT_PARAMS.EntityDescription,
      OPTICAL_PORT_PARAMS.OperationalState,
      portType === PORT_TYPE.Multiplexer
        ? OPTICAL_PORT_PARAMS.InputPower
        : OPTICAL_PORT_PARAMS.OutputPower,
    ])
  );

  return (
    <>
      <TableRow key={portNumber}>
        <TableCell>{portNumber}</TableCell>
        <TableCell>
          {data?.data[OPTICAL_PORT_PARAMS.EntityDescription]}
        </TableCell>
        <TableCell>
          {data?.data[OPTICAL_PORT_PARAMS.OperationalState]}
        </TableCell>
        {portType === PORT_TYPE.Multiplexer && (
          <TableCell>{data?.data[OPTICAL_PORT_PARAMS.InputPower]}</TableCell>
        )}
        {portType === PORT_TYPE.Demultiplexer && (
          <TableCell>{data?.data[OPTICAL_PORT_PARAMS.OutputPower]}</TableCell>
        )}        <TableCell>
          <Box display='flex'>
            {/* Show Monitor button only in monitoring routes */}
            {isMonitoringRoute && (
              <Link
                to={`/monitoring/optical-ports/${portNumber}`}
                style={{ textDecoration: 'none' }}
              >
                <Button size='small' variant='contained'>
                  Monitor
                </Button>
              </Link>
            )}
            
            {/* Show Configure button only in configuration routes */}
            {isConfigurationRoute && (
              <Link
                to={`/configuration/optical-ports/${portNumber}`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  size='small'
                  variant='contained'
                  color='secondary'
                  sx={{ ml: isMonitoringRoute ? 1 : 0 }}
                >
                  Configure
                </Button>
              </Link>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}

export default PortTableRow;
