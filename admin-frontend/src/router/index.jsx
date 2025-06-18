import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';

// ↓↓↓↓ CETTE LIGNE EST MANQUANTE DANS VOTRE FICHIER ACTUEL ↓↓↓↓
import VehiculesPage from '../pages/VehiculesPage';
import SuccursalesPage from '../pages/SuccursalesPage'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true, // Route par défaut
        element: <DashboardPage />,
      },
      // ... autres routes si vous en avez
      
      { 
        path: 'vehicules', 
        // Ligne 21 : Ici, le routeur a besoin de savoir ce qu'est "VehiculesPage"
        element: <VehiculesPage /> 
      },
      
      // Les autres routes restent inchangées pour le moment
      { path: 'reservations', element: <div>Page Réservations</div> },
      { path: 'succursales', element: <SuccursalesPage /> },
      { path: 'utilisateurs', element: <div>Page Utilisateurs (Admin)</div> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;