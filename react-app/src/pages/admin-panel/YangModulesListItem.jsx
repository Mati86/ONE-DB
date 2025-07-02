import { Box, ListItem, TextField } from '@mui/material';
import React from 'react';
import { DeleteButton } from '../common-components/DeleteButton';

function YangModulesListItem({
  yangModuleName,
  yangModuleId,
  onChange,
  onDelete,
}) {
  return (
    <ListItem disablePadding sx={{ mb: 2 }} key={yangModuleId}>
      <Box display='flex' width='100%' maxWidth={600}>
        <TextField
          sx={{ flexGrow: 1, display: 'block' }}
          size='small'
          label='Yang Module Name'
          fullWidth
          value={yangModuleName}
          onChange={e => onChange(yangModuleId, e.target.value)}
        />
      </Box>
      <DeleteButton onClick={onDelete} />
    </ListItem>
  );
}

export default YangModulesListItem;
