import { List } from '@mui/material';
import YangModulesListItem from './YangModulesListItem';

function YangModulesList({
  yangModules,
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
          onChange={onModuleNameChange}
          onDelete={() => onDelete(yangModule.id)}
        />
      ))}
    </List>
  );
}

export default YangModulesList;
