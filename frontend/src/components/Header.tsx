
import { Box, Typography } from '@mui/material';

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: '#063750',
        color: 'white',
        p: 3,
        borderRadius: 2,
        mb: 3
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 'bold' }}
      >
        OLIST | Sales Dashboard
      </Typography>

      <Typography
        variant="body2"
        sx={{ mt: 1, color: '#dce8ed' }}
      >
        Análisis de ventas, pedidos y comportamiento de clientes.
      </Typography>
    </Box>
  );
}

