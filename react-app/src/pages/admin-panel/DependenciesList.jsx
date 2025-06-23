import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  Select,
  TextField,
} from '@mui/material';
import React from 'react';
import { DeleteButton } from '../common-components/DeleteButton';
import SaveButton from './SaveButton';

function DependenciesList({
  onModuleChange,
  onDependencyNameChange,
  moduleDependencies,
  ModuleSelectOptions,
  onSaveButtonClick,
  onDependencyDelete,
  onModuleDependenciesChange,
}) {
  return (
    <List sx={{ mt: 2 }}>
      {moduleDependencies.map(dependency => (
        <ListItem disablePadding sx={{ mb: 2 }} key={dependency.id}>
          <Grid container spacing={2}>
            <Grid item lg={4} xs={4}>
              <FormControl fullWidth>
                <InputLabel id='select-module-name'>Module</InputLabel>
                <Select
                  labelId='select-module-name'
                  value={dependency.moduleId}
                  label='Module'
                  onChange={e => onModuleChange(dependency.id, e.target.value)}
                >
                  {ModuleSelectOptions}
                </Select>
              </FormControl>
            </Grid>
            <Grid item lg={4} xs={4}>
              <FormControl fullWidth>
                <InputLabel id='select-module-dependencies'>
                  Dependencies
                </InputLabel>
                <Select
                  labelId='select-module-dependencies'
                  value={dependency.dependencies}
                  label='Dependencies'
                  onChange={e =>
                    onModuleDependenciesChange(dependency.id, e.target.value)
                  }
                  multiple
                >
                  {ModuleSelectOptions}
                </Select>
              </FormControl>
            </Grid>
            <Grid item lg={2} xs={4}>
              <Box display='flex'>
                <TextField
                  size='small'
                  label='Dependency Name'
                  fullWidth
                  value={dependency.dependencyName}
                  onChange={e =>
                    onDependencyNameChange(dependency.id, e.target.value)
                  }
                />
              </Box>
            </Grid>
            <Grid
              item
              display='flex'
              sx={{ alignItems: 'center' }}
              lg={2}
              xs={4}
            >
              <SaveButton onClick={() => onSaveButtonClick(dependency.id)} />
              <DeleteButton onClick={() => onDependencyDelete(dependency.id)} />
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );
}

export default DependenciesList;
