// src/router/AppRouter.jsx

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// --- Layouts et Protection ---
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute"; // Garde pour Admin ET Employé
import AdminRoute from "./AdminRoute"; // Garde spécifique pour Admin SEULEMENT

// --- Pages ---
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import VehiculesPage from "../pages/VehiculesPage";
import SuccursalesPage from "../pages/SuccursalesPage";
import TaxesPage from "../pages/TaxesPage";
import ReservationsPage from "../pages/ReservationsPage";
import ReservationDetailPage from "../pages/ReservationDetailPage";
import ContratEditPage from "../pages/ContratEditPage";

// Assurez-vous d'avoir un composant pour cette page
import UtilisateursPage from "../pages/UtilisateursPage";

const router = createBrowserRouter([
  {
    // ROUTE PUBLIQUE : La page de connexion
    path: "/connexion",
    element: <LoginPage />,
  },
  {
    // ROUTE RACINE : Protégée pour les Admins et Employés
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // --- ROUTES ACCESSIBLES AUX ADMINS ET EMPLOYÉS ---
          { index: true, element: <DashboardPage /> },
          { path: "vehicules", element: <VehiculesPage /> },
          { path: "reservations", element: <ReservationsPage /> },

          { path: "succursales", element: <SuccursalesPage /> },

          { path: "reservations/:id", element: <ReservationDetailPage /> },

          {
            path: "contrats/:id/edit",
            element: <ContratEditPage />,
          },
          // --- ROUTES PROTÉGÉES UNIQUEMENT POUR LES ADMINS ---
          {
            element: <AdminRoute />, // On ajoute le garde "AdminRoute" ici
            children: [
              // Toutes les routes à l'intérieur de ce bloc ne seront accessibles
              // que si l'utilisateur a le rôle 'admin'.
              { path: "taxes", element: <TaxesPage /> },
              { path: "utilisateurs", element: <UtilisateursPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    // Route pour toutes les autres URL non trouvées
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
