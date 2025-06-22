import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Ce composant protège les routes de l'application.
 * @param {object} props
 * @param {boolean} props.requireProfile - Si true, l'utilisateur doit avoir un profil client complet pour accéder à la route.
 */
const ProtectedRoute = ({ requireProfile = false }) => {
  const { isAuthenticated, isProfileComplete, loading } = useAuth();
  const location = useLocation();

  // 1. Pendant que le contexte vérifie la session, on affiche un message de chargement.
  // Cela évite les "flashs" où l'utilisateur voit une page avant d'être redirigé.
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Vérification de la session...</div>;
  }

  // 2. Si l'utilisateur n'est PAS authentifié, on le redirige TOUJOURS vers la page de connexion.
  // On sauvegarde la page où il voulait aller (`state: { from: location }`) pour le rediriger après la connexion.
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }
  
  // 3. Si l'utilisateur EST authentifié, on vérifie si la route requiert un profil complet.
 if (requireProfile && !isProfileComplete) {
    // On le redirige vers /compte. On peut ajouter un état pour afficher un message spécifique.
    return <Navigate to="/compte" state={{ fromCompletion: true }} replace />;
  }

  // 4. Si toutes les vérifications passent, on affiche la page demandée.
  // <Outlet /> représente les routes enfants protégées (ex: <AccountPage />, <ReservationPage />).
  return <Outlet />;
};

export default ProtectedRoute;
