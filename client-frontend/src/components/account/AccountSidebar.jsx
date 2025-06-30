import { NavLink, useNavigate } from 'react-router-dom';
import { User, BookMarked, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccountSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const activeLink = "bg-sky-500 text-white";
  const inactiveLink = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
  
  // NOTE : `isActive` pour le lien principal du compte sera géré par NavLink lui-même
  // en vérifiant si l'URL commence par /compte.
  const headerLinkClasses = ({ isActive }) =>
    `block text-lg font-bold p-3 rounded-md mb-4 text-center transition-colors ${
      isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
    }`;


  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg flex-shrink-0">
      <div className="text-center md:text-left">
        
        {/* Ce NavLink sert maintenant de lien principal vers le profil */}
        <NavLink 
            to="/compte" 
            end // 'end' est crucial pour qu'il ne soit actif que sur /compte exact
            className={headerLinkClasses}
        >
            Mon Compte
        </NavLink>

        <ul className="space-y-2">
          
          {/* 
            ✅✅✅ CORRECTION APPLIQUÉE ICI ✅✅✅
            Le bloc <li> pour "Profile" a été supprimé car il était redondant 
            avec le bouton "Mon Compte" ci-dessus.
          */}
          
          <li>
            <NavLink
              to="/compte/reservations"
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-colors ${isActive ? activeLink : inactiveLink}`}
            >
              <BookMarked size={20} />
              <span>Mes réservations</span>
            </NavLink>
          </li>
          
          {/* Vous pouvez ajouter d'autres liens ici à l'avenir, par exemple : */}
          {/* 
          <li>
            <NavLink to="/compte/factures" className={...}>
              <FileText size={20} />
              <span>Mes Factures</span>
            </NavLink>
          </li> 
          */}

        </ul>

        <div className="border-t dark:border-slate-700 my-4"></div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-md w-full text-left text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
