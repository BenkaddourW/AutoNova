import { NavLink } from 'react-router-dom';
// On importe une icône plus stylisée pour le logo, comme 'CarFront'
import { LayoutDashboard, Car, CalendarCheck, Building, Users, CarFront,ListChecks } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const navLinks = [
    { to: '/', text: 'Dashboard', icon: LayoutDashboard, role: ['Admin', 'Agent'] },
    { to: '/vehicules', text: 'Véhicules', icon: Car, role: ['Admin', 'Agent'] },
    { to: '/reservations', text: 'Réservations', icon: CalendarCheck, role: ['Admin', 'Agent'] },
    { to: '/inspections', text: 'Inspections', icon: ListChecks, role: ['Admin', 'Agent'] },
    { to: '/succursales', text: 'Succursales', icon: Building, role: ['Admin', 'Agent'] },
    { to: '/taxes', text: 'Taxes', icon: Building, role: ['Admin'] },
    { to: '/utilisateurs', text: 'Utilisateurs', icon: Users, role: ['Admin'] },
  ];

  const activeLinkClass = "bg-sky-500 text-white";
  const defaultLinkClass = "hover:bg-slate-700 hover:text-white";

  return (
    <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col">
      {/* === MODIFICATION ICI === */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700 px-4">
        {/* Ajout de l'icône logo */}
        <CarFront className="h-8 w-8 text-sky-400 mr-3" />
        <h1 className="text-2xl font-bold text-white">AutoNova</h1>
      </div>
      {/* ======================= */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks
          .filter(link => link.role.includes(isAdmin ? 'Admin' : 'Agent'))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive ? activeLinkClass : defaultLinkClass
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              <span>{link.text}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;