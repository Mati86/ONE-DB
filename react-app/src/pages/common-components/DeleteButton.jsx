import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton } from '@mui/material';

import React from 'react';

export function DeleteButton({ onClick }) {
  return (
    <Button
      variant='contained'
      color='error'
      sx={{ marginLeft: '10px', paddingX: '20px' }}
      onClick={onClick}
    >
      Delete
    </Button>
  );
}

export function DeleteIconButton({ onClick }) {
  return (
    <IconButton
      aria-label='delete'
      variant='contained'
      color='error'
      sx={{ marginLeft: '10px', paddingX: '10px' }}
      onClick={onClick}
    >
      <DeleteIcon />
    </IconButton>
  );
}
