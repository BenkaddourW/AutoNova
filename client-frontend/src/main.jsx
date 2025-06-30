import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router'; // On importe le composant qui CONTIENT le RouterProvider
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider storageKey="autonova-client-theme" defaultTheme="dark">
      <AuthProvider>
         {/* 2. Placez le Toaster ici, à l'extérieur du Router si possible */}
      <Toaster 
        position="top-center" // Position des notifications
        reverseOrder={false}/>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
