import { List } from '@mui/material';
import YangModulesListItem from './YangModulesListItem';

function YangModulesList({
  yangModules,
  onSaveButtonClick,
  onModuleNameChange,
  onDelete,
}) {
  return (
    <List sx={{ mt: 2 }}>
      {yangModules.map(yangModule => (
        <YangModulesListItem
          key={yangModule.id}
          yangModuleId={yangModule.id}
          yangModuleName={yangModule.name}
          onSave={() => onSaveButtonClick(yangModule.id)}
          onChange={onModuleNameChange}
          onDelete={() => onDelete(yangModule.id)}
        />
      ))}
    </List>
  );
}

export default YangModulesList;
