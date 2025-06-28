import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeProvider.jsx'; 
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './router/index.jsx';
import { Toaster } from 'react-hot-toast'; // Importer Toaster pour les notifications

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envelopper l'application */}
    <ThemeProvider defaultTheme="dark" storageKey="autonova-theme">
      
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);