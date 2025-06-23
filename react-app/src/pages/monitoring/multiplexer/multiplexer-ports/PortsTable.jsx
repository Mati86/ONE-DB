import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import {
  DEMUX_OPTICAL_PORT_NUMBERS,
  MUX_OPTICAL_PORT_NUMBERS,
  PORT_TYPE,
} from '../../../../utils/data';
import PortTableRow from './PortTableRow';

function PortsTable({ portType }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Port</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Operational State</TableCell>
            {portType === PORT_TYPE.Multiplexer && (
              <TableCell sx={{ fontWeight: 'bold' }}>
                Input Power (dBm)
              </TableCell>
            )}
            {portType === PORT_TYPE.Demultiplexer && (
              <TableCell sx={{ fontWeight: 'bold' }}>
                Output Power (dBm)
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(portType === PORT_TYPE.Multiplexer
            ? MUX_OPTICAL_PORT_NUMBERS
            : DEMUX_OPTICAL_PORT_NUMBERS
          ).map(portNumber => (
            <PortTableRow
              key={portNumber}
              portNumber={portNumber}
              portType={portType}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PortsTable;
