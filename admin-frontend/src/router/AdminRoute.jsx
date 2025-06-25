// src/router/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }
  
  // Si l'utilisateur est admin, on le laisse passer. Sinon, on le redirige.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
