import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeProvider.jsx'; // Importer le Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envelopper l'application */}
    <ThemeProvider defaultTheme="dark" storageKey="autonova-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);