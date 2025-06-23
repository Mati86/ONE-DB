import SaveIcon from '@mui/icons-material/Save';
import { Button } from '@mui/material';
import React from 'react';

function SaveButton({ onClick }) {
  return (
    <Button
      variant='contained'
      color='secondary'
      sx={{ marginLeft: '10px', paddingX: '20px' }}
      endIcon={<SaveIcon />}
      onClick={onClick}
    >
      Save
    </Button>
  );
}

export default SaveButton;
