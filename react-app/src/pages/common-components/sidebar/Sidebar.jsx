import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LabelIcon from '@mui/icons-material/LabelImportant';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useState } from 'react';

import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [configurationSidebarOpen, setConfigurationSidebarOpen] =
    useState(true);
  const [monitoringSidebarOpen, setMonitoringSidebarOpen] = useState(true);

  const toggleConfigurationSidebar = () =>
    setConfigurationSidebarOpen(prev => !prev);
  const toggleMonitoringSidebar = () => setMonitoringSidebarOpen(prev => !prev);

  return (
    <Box
      sx={{
        flex: 1,
        borderRight: '0.5px solid rgb(230, 227, 227)',
        minHeight: '100vh',
        backgroundColor: 'white',
        fontSize: '12px',
      }}
    >
      <Box
        sx={{
          height: 49,
        }}
      ></Box>
      <Divider />
      <Box sx={{ pt: 2 }}>
        <Box>
          <Link to='/' style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <SidebarButtonText text='Dashboard' />
            </ListItemButton>
          </Link>
          <Link to='/settings' style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <SettingsApplicationsIcon />
              </ListItemIcon>
              <SidebarButtonText text='Settings' />
            </ListItemButton>
          </Link>
          <Link to='/admin' style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <SidebarButtonText text='Admin' />
            </ListItemButton>
          </Link>

          <ListItemButton onClick={toggleConfigurationSidebar}>
            <ListItemIcon>
              <EditNoteIcon />
            </ListItemIcon>
            <SidebarButtonText text='Configuration' />
            {/* <ListItemText primary='Configuration' /> */}
            {configurationSidebarOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={configurationSidebarOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <Link
                to='/configuration/booster'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Booster' />
                </ListItemButton>
              </Link>              <Link
                to='/configuration/preamplifier'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Preamplifier' />
                </ListItemButton>
              </Link>
              <Link
                to='/configuration/multiplexer'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Multiplexer' />
                </ListItemButton>
              </Link>
              <Link
                to='/configuration/demultiplexer'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Demultiplexer' />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>

          <ListItemButton onClick={toggleMonitoringSidebar}>
            <ListItemIcon>
              <MonitorHeartIcon />
            </ListItemIcon>
            <SidebarButtonText text='Monitoring' />
            {monitoringSidebarOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={monitoringSidebarOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <Link to='/monitoring/booster' style={{ textDecoration: 'none' }}>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Booster' />
                </ListItemButton>
              </Link>

              <Link
                to='/monitoring/preamplifier'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Preamplifier' />
                </ListItemButton>
              </Link>
              <Link
                to='/monitoring/multiplexer/ports'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Multiplexer' />
                </ListItemButton>
              </Link>
              <Link
                to='/monitoring/demultiplexer/ports'
                style={{ textDecoration: 'none' }}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <SidebarButtonText text='Demultiplexer' />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

function SidebarButtonText({ text }) {
  return (
    <ListItemText
      primary={text}
      primaryTypographyProps={{ fontWeight: 500, color: 'GrayText' }}
    />
  );
}

export default Sidebar;
