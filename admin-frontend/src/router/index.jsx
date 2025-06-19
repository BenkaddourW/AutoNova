import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';

// ↓↓↓↓ CETTE LIGNE EST MANQUANTE DANS VOTRE FICHIER ACTUEL ↓↓↓↓
import VehiculesPage from '../pages/VehiculesPage';
import SuccursalesPage from '../pages/SuccursalesPage'; 
import TaxesPage from '../pages/TaxesPage';
import InspectionVehiculePage from '../pages/InspectionVehiculePage';
import ContratInspectionPage from '../pages/ContratInspectionPage'; 


const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true, element: <DashboardPage />,
      },
     
      
      {  path: 'vehicules', element: <VehiculesPage /> },
      { path: 'reservations', element: <div>Page Réservations</div> },
      {path: 'inspections',element: <InspectionVehiculePage /> },
      { path: 'contrats/:idcontrat/inspection', element: <ContratInspectionPage /> },
      { path: 'succursales', element: <SuccursalesPage /> },
      { path: 'taxes', element: <TaxesPage /> },
      { path: 'utilisateurs', element: <div>Page Utilisateurs (Admin)</div> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;