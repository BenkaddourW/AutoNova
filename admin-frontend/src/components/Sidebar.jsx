// Sidebar.jsx

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarCheck, Building, Users, CarFront, ListChecks, LogOut, Banknote } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    // --- CORRECTION : Ajout de l'icône pour le Dashboard ---
    { to: '/', text: 'Dashboard', icon: LayoutDashboard, role: ['admin', 'employe'] },
    // ====================================================
    { to: '/vehicules', text: 'Véhicules', icon: Car, role: ['admin', 'employe'] },
    { to: '/reservations', text: 'Réservations', icon: CalendarCheck, role: ['admin', 'employe'] },
    { to: '/succursales', text: 'Succursales', icon: Building, role: ['admin', 'employe'] },
    { to: '/taxes', text: 'Taxes', icon: Banknote, role: ['admin'] },
    { to: '/utilisateurs', text: 'Utilisateurs', icon: Users, role: ['admin'] },
  ];

  const activeLinkClass = "bg-sky-500 text-white";
  const defaultLinkClass = "hover:bg-slate-700 hover:text-white";
  const buttonClass = "flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 w-full text-left";

  const handleLogout = () => {
    logout();
    toast.success('Vous avez été déconnecté.');
    navigate('/connexion');
  };

  return (
    <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col">
      <div className="h-20 flex items-center justify-center border-b border-slate-700 px-4">
        <CarFront className="h-8 w-8 text-sky-400 mr-3" />
        <h1 className="text-2xl font-bold text-white">AutoNova</h1>
      </div>
      
      <nav className="flex-1 flex flex-col px-4 py-6 space-y-2">
        {navLinks
          .filter(link => user && link.role.includes(user.role))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `${buttonClass} ${isActive ? activeLinkClass : defaultLinkClass}`
              }
            >
              {/* On s'assure que l'icône existe avant de la rendre */}
              {link.icon && <link.icon className="h-5 w-5" />}
              <span>{link.text}</span>
            </NavLink>
          ))}
        
        <div className="mt-auto pt-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className={`${buttonClass} ${defaultLinkClass}`}
          >
            <LogOut className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-medium">Se déconnecter</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
