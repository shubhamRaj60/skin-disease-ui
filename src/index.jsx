// src/index.jsx (Updated with MUI Theme Provider)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
export { notificationService } from './NotificationService';
export { default as apiService } from './api';
// NEW IMPORTS:
import { ThemeProvider, createTheme } from '@mui/material/styles'; 

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Deep Blue (professional look)
    },
    secondary: {
      main: '#fbbf24', // Amber/Yellow (warning/accent)
    },
    error: {
      main: '#dc2626', // Red (danger/high priority)
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* WRAP THE APP WITH ThemeProvider */}
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);