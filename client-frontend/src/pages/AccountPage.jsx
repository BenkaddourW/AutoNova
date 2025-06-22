// src/pages/AccountPage.js

import { Outlet, useLocation } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
    const { user, isProfileComplete, loading } = useAuth();
    const location = useLocation();

    // Vérifie si on vient d'être redirigé car le profil était incomplet
    const fromCompletion = location.state?.fromCompletion;
    
    if (loading) {
        return <div className="text-center py-20">Chargement de votre compte...</div>;
    }
    
    if (!user) {
        // Ce cas est une sécurité, normalement géré par ProtectedRoute.
        return <div className="text-center py-20">Veuillez vous connecter.</div>;
    }
    
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* === Colonne de Gauche : La barre latérale de navigation === */}
                <AccountSidebar />

                {/* === Colonne de Droite : Le contenu dynamique === */}
                <div className="flex-1 w-full">
                    {/* Affiche un message de bienvenue si le profil est incomplet */}
                    {!isProfileComplete && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-md" role="alert">
                            <h2 className="font-bold text-lg">Bienvenue, {user.prenom} !</h2>
                            <p className="mt-1">
                                Pour finaliser votre compte et pouvoir effectuer des réservations, veuillez compléter les informations de votre profil ci-dessous.
                            </p>
                        </div>
                    )}
                    
                    {/* Affiche un message si l'utilisateur a été redirigé (ex: depuis /reservation) */}
                    {fromCompletion && !isProfileComplete && (
                         <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 mb-6 rounded-md shadow-md" role="alert">
                             <p className="font-medium">Vous devez compléter votre profil avant de pouvoir accéder à la page précédente.</p>
                         </div>
                    )}
                    
                    {/* L'Outlet rendra toujours ProfileDetails (ou BookingsList, etc.) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
