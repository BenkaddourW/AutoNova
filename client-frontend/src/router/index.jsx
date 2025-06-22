// src/router/AppRouter.js

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// --- Layouts ---
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// --- Pages ---
import HomePage from '../pages/HomePage';
import VehiclesPage from '../pages/VehiclesPage';
import VehicleDetailsPage from '../pages/VehicleDetailsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import AccountPage from '../pages/AccountPage';
import ReservationPage from '../pages/ReservationPage';

// --- Composants de Contenu pour le Compte ---
import ProfileDetails from '../components/account/ProfileDetails';

// --- Composants de Routage ---
import ProtectedRoute from './ProtectedRoute';

// Le Layout principal de l'application
const AppLayout = () => (
  <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Définition de toutes les routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // --- Routes Publiques ---
      { index: true, element: <HomePage /> },
      { path: 'connexion', element: <LoginPage /> },
      { path: 'inscription', element: <RegisterPage /> },
      { path: 'vehicules', element: <VehiclesPage /> },
      { path: 'vehicules/:id', element: <VehicleDetailsPage /> },
      { path: 'a-propos', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },

      // --- Routes Protégées ---
      {
        element: <ProtectedRoute />, // Ce parent vérifie si l'utilisateur est connecté pour toutes les routes enfants.
        children: [
          // La page /compte est maintenant la destination principale pour les utilisateurs connectés.
          {
            path: 'compte',
            element: <AccountPage />,
            children: [
              {
                index: true,
                element: <ProfileDetails />,
              },
              {
                // Note : Cette route sera accessible même si le profil est incomplet.
                // Pour la protéger, il faudrait la déplacer dans le groupe requireProfile={true}
                path: 'reservations',
                element: <div>Historique des réservations.</div>,
              },
            ],
          },
          // Ce sous-groupe vérifie EN PLUS si le profil est complet.
          {
            element: <ProtectedRoute requireProfile={true} />,
            children: [
              {
                path: 'reservation',
                element: <ReservationPage />,
              },
              // Ajoutez ici d'autres routes qui nécessitent un profil complet.
            ],
          },
        ],
      },
      
      // Route "catch-all" pour les pages non trouvées
      { path: '*', element: <div className="text-center py-20"><h1>404 - Page Non Trouvée</h1></div> },
    ],
  },
]);

// Le composant qui fournit le routeur à l'application
const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;