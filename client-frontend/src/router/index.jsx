import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// --- Layouts ---
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// --- Pages Publiques (importées directement pour un chargement rapide de la page d'accueil) ---
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// --- Pages importées avec Lazy Loading ---
const VehiclesPage = lazy(() => import('../pages/VehiclesPage'));
const VehicleDetailsPage = lazy(() => import('../pages/VehicleDetailsPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const ReservationPage = lazy(() => import('../pages/ReservationPage'));
const PaymentPage = lazy(() => import('../pages/PaymentPage'));
const ConfirmationPage = lazy(() => import('../pages/ConfirmationPage'));
const CompleteProfilePage = lazy(() => import('../pages/CompleteProfilePage'));

// --- Composants de Contenu pour le Compte (Lazy Loaded) ---
const ProfileDetails = lazy(() => import('../components/account/ProfileDetails'));
const BookingsListPage = lazy(() => import('../components/account/BookingsListPage')); 

// ✅✅✅ LA CORRECTION EST ICI : ON IMPORTE LE NOUVEAU COMPOSANT ✅✅✅
const BookingDetailPage = lazy(() => import('../pages/BookingDetailPage'));


// --- Composants de Routage ---
import ProtectedRoute from './ProtectedRoute';

// Composant pour afficher un indicateur de chargement pendant le lazy loading
const LazyLoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

// Le Layout principal de l'application
const AppLayout = () => (
  <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      {/* Suspense est nécessaire pour le lazy loading */}
      <Suspense fallback={<LazyLoadingFallback />}>
        <Outlet />
      </Suspense>
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
        element: <ProtectedRoute />,
        children: [
          // Pages nécessitant uniquement une connexion
          { path: 'paiement', element: <PaymentPage /> },
          { path: 'reservation/confirmation', element: <ConfirmationPage /> },
          { path: 'completer-profil', element: <CompleteProfilePage /> },

          // La page /compte est la destination principale pour les utilisateurs connectés.
          {
            path: 'compte',
            element: <AccountPage />,
            children: [
              {
                index: true,
                element: <ProfileDetails />,
              },
              {
                path: 'reservations',
                element: <BookingsListPage />,
              },
              // La route est maintenant valide car BookingDetailPage est importé
              {
                path: 'reservations/:id',
                element: <BookingDetailPage />,
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
            ],
          },
        ],
      },
      
      // Route "catch-all" pour les pages non trouvées
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

// Le composant qui fournit le routeur à l'application
const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
