import { useState, Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Car, User, LogIn, Menu as MenuIcon, X, ChevronDown, LayoutDashboard, BookMarked, LogOut } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { useAuth } from '../../context/AuthContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';

const Navbar = () => {
  const scrolled = useScroll(50);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canAccessDashboard = user?.role === 'admin' || user?.role === 'employe';

  const navLinkClasses = `py-2 px-4 rounded-md text-sm font-medium transition-colors ${
    scrolled || isMenuOpen
      ? 'text-slate-800 hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-400'
      : 'text-white hover:text-sky-300'
  }`;

  const handleLogout = () => logout(navigate);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled || isMenuOpen
        ? 'bg-white/95 dark:bg-slate-900/95 shadow-md border-b border-slate-200 dark:border-slate-700'
        : 'bg-gradient-to-b from-black/70 to-transparent text-white backdrop-blur-sm shadow-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO + TITRE */}
          <NavLink to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Car className="h-8 w-8 text-sky-500" />
            <span className={`text-2xl font-bold transition-colors ${scrolled || isMenuOpen ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              AutoNova
            </span>
          </NavLink>

          {/* MENU NAVIGATION – Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/vehicules" className={navLinkClasses}>Nos Véhicules</NavLink>
            <NavLink to="/a-propos" className={navLinkClasses}>À Propos</NavLink>
            <NavLink to="/contact" className={navLinkClasses}>Contact</NavLink>
          </div>

          {/* UTILISATEUR & SWITCH THEME – Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <div className={`w-px h-6 ${scrolled || isMenuOpen ? 'bg-slate-300 dark:bg-slate-700' : 'bg-white/40'}`}></div>

            {isAuthenticated ? (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="btn-primary inline-flex w-full justify-center items-center gap-2">
                    {user.prenom}
                    <ChevronDown className="-mr-1 h-5 w-5" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="p-1">
                      {canAccessDashboard && (
                        <Menu.Item>
                          {({ active }) => (
                            <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer"
                              className={`${active ? 'bg-sky-500 text-white' : 'text-slate-900 dark:text-slate-100'} group flex items-center rounded-md px-2 py-2 text-sm`}>
                              <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard Admin
                            </a>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink to="/compte"
                            className={`${active ? 'bg-sky-500 text-white' : 'text-slate-900 dark:text-slate-100'} group flex items-center rounded-md px-2 py-2 text-sm`}>
                            <User className="mr-2 h-5 w-5" /> Mon Compte
                          </NavLink>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink to="/compte"
                            className={`${active ? 'bg-sky-500 text-white' : 'text-slate-900 dark:text-slate-100'} group flex items-center rounded-md px-2 py-2 text-sm`}>
                            <BookMarked className="mr-2 h-5 w-5" /> Mes Réservations
                          </NavLink>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button onClick={handleLogout}
                            className={`${active ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-slate-100'} group flex items-center rounded-md px-2 py-2 text-sm`}>
                            <LogOut className="mr-2 h-5 w-5" /> Se déconnecter
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <NavLink to="/connexion" className="btn-primary flex items-center gap-2">
                <LogIn size={18} /> Se connecter
              </NavLink>
            )}
          </div>

          {/* MENU BURGER – Mobile */}
          <div className="md:hidden flex items-center">
            <ThemeSwitcher />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`ml-2 p-2 rounded-md ${scrolled || isMenuOpen ? 'text-slate-800 dark:text-white' : 'text-white'}`}>
              {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white dark:bg-slate-900 shadow-md">
          <NavLink to="/vehicules" className="block py-2 text-slate-800 dark:text-slate-100">Nos Véhicules</NavLink>
          <NavLink to="/a-propos" className="block py-2 text-slate-800 dark:text-slate-100">À Propos</NavLink>
          <NavLink to="/contact" className="block py-2 text-slate-800 dark:text-slate-100">Contact</NavLink>
          <hr className="border-slate-200 dark:border-slate-700" />
          {isAuthenticated ? (
            <>
              {canAccessDashboard && (
                <a href="http://localhost:5174" target="_blank" rel="noreferrer"
                  className="block py-2 text-sky-600 dark:text-sky-400">Dashboard</a>
              )}
              <NavLink to="/compte" className="block py-2">Mon Compte</NavLink>
              <NavLink to="/compte" className="block py-2">Mes Réservations</NavLink>
              <button onClick={handleLogout} className="block py-2 text-red-600">Se déconnecter</button>
            </>
          ) : (
            <NavLink to="/connexion" className="btn-primary w-full text-center">Se connecter</NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
