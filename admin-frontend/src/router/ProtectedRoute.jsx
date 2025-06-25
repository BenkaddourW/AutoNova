// src/router/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  // On récupère les informations du contexte
  const { isAuthorized, isLoading } = useAuth();
  const location = useLocation();

  // 1. On attend la fin du chargement initial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 2. Si le chargement est terminé ET que l'utilisateur est autorisé (admin ou employé),
  //    on le laisse accéder aux routes enfants (le DashboardLayout).
  if (isAuthorized) {
    return <Outlet />;
  }

  // 3. Si l'utilisateur n'est pas autorisé, on le redirige vers la page de connexion.
  return <Navigate to="/connexion" state={{ from: location }} replace />;
};

export default ProtectedRoute;