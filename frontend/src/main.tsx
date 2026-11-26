import '@fontsource-variable/dm-sans';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans Variable", system-ui, sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 650 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);