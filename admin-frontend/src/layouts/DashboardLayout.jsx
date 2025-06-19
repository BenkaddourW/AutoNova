import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher'; // Importer le switcher

const DashboardLayout = () => {
  return (
    // AJOUT DES CLASSES POUR LE THÈME LIGHT/DARK
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER DE LA ZONE DE CONTENU */}
        <header className="flex justify-end items-center p-4">
          <ThemeSwitcher />
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;