import { Box } from '@mui/material';

const Navbar = () => {
  return (
    <Box
      sx={{
        height: '50px',
        borderBottom: '0.5px solid rgb(231, 228, 228)',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#555',
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 20,
              position: 'relative',
            }}
          >
            <img
              src='https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
              alt=''
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                position: 'absolute',
              }}
            />
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
