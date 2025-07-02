import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LabelIcon from '@mui/icons-material/LabelImportant';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [configurationSidebarOpen, setConfigurationSidebarOpen] =
    useState(true);
  const [monitoringSidebarOpen, setMonitoringSidebarOpen] = useState(true);
  const location = useLocation(); // For active state detection

  const toggleConfigurationSidebar = () =>
    setConfigurationSidebarOpen(prev => !prev);
  const toggleMonitoringSidebar = () => setMonitoringSidebarOpen(prev => !prev);

  // Helper function to check if route is active
  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        flex: 1,
        borderRight: '1px solid #e2e8f0',
        minHeight: '100vh',
        background: 'white',
        fontSize: '14px',
        boxShadow: '1px 0 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header to match navbar height */}
      <Box
        sx={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: '3rem'}}>
          ONE
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#e2e8f0' }} />
      <Box sx={{ pt: 2, pb: 2 }}>
        <Box>
          <Link to='/' style={{ textDecoration: 'none' }}>
            <ListItemButton
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive('/') ? '#dbeafe' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: isActive('/') ? '#3b82f6' : '#64748b' }}>
                <DashboardIcon />
              </ListItemIcon>
              <SidebarButtonText text='Dashboard' isActive={isActive('/')} />
            </ListItemButton>
          </Link>
          <Link to='/admin' style={{ textDecoration: 'none' }}>
            <ListItemButton
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive('/admin') ? '#dbeafe' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: isActive('/admin') ? '#3b82f6' : '#64748b' }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <SidebarButtonText text='Admin Panel' isActive={isActive('/admin')} />
            </ListItemButton>
          </Link>

          <Divider sx={{ my: 2, mx: 2, borderColor: '#e2e8f0' }} />

          <ListItemButton 
            onClick={toggleConfigurationSidebar}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&:hover': {
                backgroundColor: '#f8fafc',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#64748b' }}>
              <EditNoteIcon />
            </ListItemIcon>
            <SidebarButtonText text='Configuration' />
            {configurationSidebarOpen ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />}
          </ListItemButton>
          <Collapse in={configurationSidebarOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <Link to='/configuration/booster' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/configuration/booster') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/configuration/booster') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Booster' isActive={isActive('/configuration/booster')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/configuration/preamplifier' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/configuration/preamplifier') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/configuration/preamplifier') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Preamplifier' isActive={isActive('/configuration/preamplifier')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/configuration/multiplexer' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/configuration/multiplexer') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/configuration/multiplexer') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Multiplexer' isActive={isActive('/configuration/multiplexer')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/configuration/demultiplexer' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/configuration/demultiplexer') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/configuration/demultiplexer') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Demultiplexer' isActive={isActive('/configuration/demultiplexer')} isSubItem={true} />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>

          <ListItemButton 
            onClick={toggleMonitoringSidebar}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&:hover': {
                backgroundColor: '#f8fafc',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#64748b' }}>
              <MonitorHeartIcon />
            </ListItemIcon>
            <SidebarButtonText text='Monitoring' />
            {monitoringSidebarOpen ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />}
          </ListItemButton>
          <Collapse in={monitoringSidebarOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <Link to='/monitoring/booster' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/monitoring/booster') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/monitoring/booster') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Booster' isActive={isActive('/monitoring/booster')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/monitoring/preamplifier' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/monitoring/preamplifier') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/monitoring/preamplifier') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Preamplifier' isActive={isActive('/monitoring/preamplifier')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/monitoring/multiplexer/ports' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/monitoring/multiplexer/ports') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/monitoring/multiplexer/ports') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Multiplexer' isActive={isActive('/monitoring/multiplexer/ports')} isSubItem={true} />
                </ListItemButton>
              </Link>
              <Link to='/monitoring/demultiplexer/ports' style={{ textDecoration: 'none' }}>
                <ListItemButton 
                  sx={{ 
                    pl: 4, 
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive('/monitoring/demultiplexer/ports') ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(2px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive('/monitoring/demultiplexer/ports') ? '#3b82f6' : '#94a3b8' }}>
                    <LabelIcon fontSize="small" />
                  </ListItemIcon>
                  <SidebarButtonText text='Demultiplexer' isActive={isActive('/monitoring/demultiplexer/ports')} isSubItem={true} />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

function SidebarButtonText({ text, isActive = false, isSubItem = false }) {
  return (
    <ListItemText
      primary={text}
      primaryTypographyProps={{
        fontWeight: isActive ? 600 : (isSubItem ? 400 : 500),
        color: isActive ? '#3b82f6' : (isSubItem ? '#64748b' : '#374151'),
        fontSize: isSubItem ? '0.875rem' : '0.95rem',
      }}
    />
  );
}

export default Sidebar;
