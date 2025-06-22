import { NavLink, useNavigate } from 'react-router-dom';
import { User, BookMarked, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccountSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // La fonction logout dans le contexte devrait gérer la redirection
    logout(); 
    // Si elle ne le fait pas, vous pouvez la laisser ici : navigate('/connexion');
  };

  const activeLink = "bg-sky-500 text-white";
  const inactiveLink = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
  const headerActiveLink = "bg-orange-500 text-white";
  const headerInactiveLink = "bg-slate-200 dark:bg-slate-700"; // Un style pour quand on n'est pas sur la page principale du compte

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg flex-shrink-0">
      <div className="text-center md:text-left">
        {/* --- CORRECTION APPLIQUÉE ICI --- */}
        {/* On utilise ({ isActive }) au lieu de window.location.pathname */}
        <NavLink 
            to="/compte" 
            end // 'end' est crucial pour que ce lien ne soit actif que sur '/compte' exact
            className={({ isActive }) => 
              `block text-lg font-bold p-3 rounded-md mb-4 text-center transition-colors ${isActive ? headerActiveLink : headerInactiveLink}`
            }
        >
            My Account
        </NavLink>

        <ul className="space-y-2">
          <li>
            <NavLink
              to="/compte" // La route de base pour le profil
              end
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-colors ${isActive ? activeLink : inactiveLink}`}
            >
              <User size={20} />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/compte/reservations"
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-colors ${isActive ? activeLink : inactiveLink}`}
            >
              <BookMarked size={20} />
              <span>Mes réservations</span>
            </NavLink>
          </li>
        </ul>
        <div className="border-t dark:border-slate-700 my-4"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-md w-full text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
