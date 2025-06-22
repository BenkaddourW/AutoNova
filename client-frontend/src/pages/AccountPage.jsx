import { Outlet } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AccountPage = () => {
    const { user, clientProfile, loading } = useAuth();
    
    // La logique de chargement et de vérification du profil reste ici
    if (loading) {
        return <div className="text-center py-20">Chargement de votre compte...</div>;
    }
    
    if (user && !clientProfile) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold">Bienvenue, {user.prenom} !</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 mb-8">
                    Votre profil est incomplet. Veuillez le finaliser.
                </p>
                <Link to="/completer-profil" className="btn-primary">
                    Compléter mon profil
                </Link>
            </div>
        );
    }
    
    if (!user) {
        return <div className="text-center py-20">Veuillez vous connecter.</div>;
    }
    
    // Le JSX est maintenant un layout à deux colonnes
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* === Colonne de Gauche : La barre latérale de navigation === */}
                <AccountSidebar />

                {/* === Colonne de Droite : Le contenu dynamique === */}
                <div className="flex-1 w-full">
                    {/* C'est ici que le routeur affichera ProfileDetails ou BookingsList */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
