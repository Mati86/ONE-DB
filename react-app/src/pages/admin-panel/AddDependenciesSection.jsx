import AddCirceIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, MenuItem, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { saveYangModuleDependencies } from '../../utils/api';
import { notifySuccess } from '../../utils/utils';
import DependenciesList from './DependenciesList';

function AddDependenciesSection({ yangModules, deviceCredentials, currentDeviceId }) {
  const [moduleDependencies, setModuleDependencies] = useState([]);

  function handleAddButtonClick() {
  // Check if yangModules array has items before accessing
  if (yangModules.length === 0) {
    toast.error('Please add Yang Modules first before creating dependencies');
    return;
  }

  setModuleDependencies(prev => {
    return [
      ...prev,
      {
        id: uuidv4(),
        moduleId: yangModules[0].id, // Now safe to access
        dependencies: [],
        dependencyName: '',
      },
    ];
  });
}

  function handleDependencyDelete(dependencyId) {
    setModuleDependencies(prev => {
      const filtered = prev.filter(
        dependency => dependency.id !== dependencyId
      );
      const storageKey = currentDeviceId ? `yangModuleDependencies_${currentDeviceId}` : 'yangModuleDependencies';
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return filtered;
    });
  }

  function handleDependencyNameChange(dependencyId, dependencyName) {
    setModuleDependencies(prev => {
      return prev.map(dependency => {
        return dependency.id === dependencyId
          ? { ...dependency, dependencyName }
          : dependency;
      });
    });
  }

  function handleModuleChange(dependencyId, moduleId) {
    setModuleDependencies(prev => {
      return prev.map(dependency => {
        return dependency.id === dependencyId
          ? { ...dependency, moduleId }
          : dependency;
      });
    });
  }

  function handleModuleDependenciesChange(dependencyId, moduleDependencies) {
    setModuleDependencies(prev => {
      return prev.map(dependency => {
        return dependency.id === dependencyId
          ? { ...dependency, dependencies: moduleDependencies }
          : dependency;
      });
    });
  }

  function getYangModule(id) {
    return yangModules.find(yangModule => yangModule.id === id);
  }

  async function saveAllModuleDependencies() {
    try {
      await saveYangModuleDependencies({
        schemas: moduleDependencies.map(dependency => {
          return {
            name: getYangModule(dependency.moduleId).name,
            dependencies: dependency.dependencies.map(
              dependency => getYangModule(dependency).name
            ),
            dependency_name: dependency.dependencyName,
          };
        }),
        deviceId: currentDeviceId,
      });
      saveYangModuleDependenciesToLocalStorage();
      notifySuccess('Module Dependencies Saved');
    } catch (e) {
      toast.error(e.message);
    }
  }

  function saveYangModuleDependenciesToLocalStorage() {
    const storageKey = currentDeviceId ? `yangModuleDependencies_${currentDeviceId}` : 'yangModuleDependencies';
    localStorage.setItem(
      storageKey,
      JSON.stringify(moduleDependencies)
    );
  }

  const ModuleSelectOptions = useMemo(() => {
    return yangModules.map(yangModule => (
      <MenuItem value={yangModule.id} key={yangModule.id}>
        {yangModule.name}
      </MenuItem>
    ));
  }, [yangModules]);

  useEffect(() => {
    const storageKey = currentDeviceId ? `yangModuleDependencies_${currentDeviceId}` : 'yangModuleDependencies';
    const locallyStoredModuleDependencies = localStorage.getItem(storageKey);
    if (locallyStoredModuleDependencies)
      setModuleDependencies(JSON.parse(locallyStoredModuleDependencies));
    else 
      setModuleDependencies([]);
  }, [currentDeviceId]);

  return (
    <Box>
      <Typography variant='h5'> Yang Module Dependencies </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant='contained'
          startIcon={<AddCirceIcon />}
          onClick={handleAddButtonClick}
        >
          Add
        </Button>
        <DependenciesList
          ModuleSelectOptions={ModuleSelectOptions}
          moduleDependencies={moduleDependencies}
          onModuleChange={handleModuleChange}
          onDependencyNameChange={handleDependencyNameChange}
          onModuleDependenciesChange={handleModuleDependenciesChange}
          onDependencyDelete={handleDependencyDelete}
        />
        {!!moduleDependencies.length && (
          <Button
            variant='contained'
            sx={{ paddingX: '20px' }}
            onClick={saveAllModuleDependencies}
            endIcon={<SaveIcon />}
          >
            Save All
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default AddDependenciesSection;
