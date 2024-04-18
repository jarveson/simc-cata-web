import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const mountNode = document.getElementById('app');
const root = createRoot(mountNode);
root.render(<ThemeProvider theme={defaultTheme}><App /></ThemeProvider>);
