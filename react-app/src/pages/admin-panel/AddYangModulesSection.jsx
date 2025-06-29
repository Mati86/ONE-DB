import AddCirceIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { saveYangModules } from '../../utils/api';
import { notifySuccess } from '../../utils/utils';
import YangModulesList from './YangModulesList';

function AddYangModulesSection({
  yangModules,
  setYangModules,
  deviceCredentials,
  currentDeviceId,
}) {
  function handleAddButtonClick() {
    setYangModules(prev => {
      return [...prev, { name: '', id: uuidv4() }];
    });
  }

  function handleModuleNameChange(yangModuleId, name) {
    setYangModules(prev => {
      return prev.map(yangModule => {
        return yangModule.id === yangModuleId
          ? { ...yangModule, name }
          : yangModule;
      });
    });
  }

  async function saveYangModule(yangModuleId) {
    try {
      await saveYangModules({
        schemas: [
          {
            name: yangModules.find(yangModule => yangModule.id === yangModuleId)
              .name,
          },
        ],
        credentials: deviceCredentials,
        deviceId: currentDeviceId,
      });
      saveYangModulesToLocalStorage();
      notifySuccess('Yang Module Saved');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function saveAllYangModules() {
    try {
      await saveYangModules({
        schemas: yangModules.map(yangModule => ({
          name: yangModule.name,
        })),
        credentials: deviceCredentials,
        deviceId: currentDeviceId,
      });
      saveYangModulesToLocalStorage();
      notifySuccess('Yang Modules Saved');
    } catch (e) {
      toast.error(e.message);
    }
  }

  function handleYandModuleDelete(yangModuleId) {
    setYangModules(prev => {
      const filtered = prev.filter(
        yangModule => yangModule.id !== yangModuleId
      );
      const storageKey = currentDeviceId ? `yangModules_${currentDeviceId}` : 'yangModules';
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return filtered;
    });
  }

  function saveYangModulesToLocalStorage() {
    const storageKey = currentDeviceId ? `yangModules_${currentDeviceId}` : 'yangModules';
    localStorage.setItem(storageKey, JSON.stringify(yangModules));
  }

  return (
    <Box>
      <Typography variant='h5'> Device Yang Modules </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant='contained'
          startIcon={<AddCirceIcon />}
          onClick={handleAddButtonClick}
        >
          Add
        </Button>
        <YangModulesList
          yangModules={yangModules}
          onModuleNameChange={handleModuleNameChange}
          onSaveButtonClick={saveYangModule}
          onDelete={handleYandModuleDelete}
        />
        {!!yangModules.length && (
          <Button
            variant='contained'
            sx={{ paddingX: '20px' }}
            endIcon={<SaveIcon />}
            onClick={saveAllYangModules}
          >
            Save All
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default AddYangModulesSection;
