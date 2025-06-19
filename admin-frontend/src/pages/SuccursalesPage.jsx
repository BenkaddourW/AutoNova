import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Car, Building, BookMarked, Download } from 'lucide-react';

// --- Services ---
import * as succursaleService from '../services/succursaleService';
import { getDashboardStats } from '../services/statsService';

// --- Composants ---
import SuccursalesTable from '../components/SuccursalesTable';
import SuccursalesForm from '../components/SuccursalesForm';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import TopListCard from '../components/TopListCard';
import SuccursalesFilters from '../components/SuccursalesFilters';

// --- Hooks ---
import { useDebounce } from '../hooks/useDebounce';
import { useCSVExport } from '../hooks/useCSVExport';

const SuccursalesPage = () => {
  // === ÉTATS ===
  const [succursales, setSuccursales] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [filters, setFilters] = useState({ nom: '', ville: '' });
  const debouncedNomFilter = useDebounce(filters.nom, 500);
  const [villes, setVilles] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSuccursale, setCurrentSuccursale] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const exportCSV = useCSVExport('export_succursales.csv');

  // --- HANDLER DE NOTIFICATION (Stable) ---
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // --- LOGIQUE DE FETCH (Simplifiée et corrigée) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingDashboard(true);
        const [dashData, allSuccursales] = await Promise.all([
          getDashboardStats(),
          succursaleService.getSuccursales() // On récupère toutes les succursales pour le filtre des villes
        ]);
        setDashboardData(dashData);
        if (allSuccursales && Array.isArray(allSuccursales)) {
          const uniqueVilles = [...new Set(allSuccursales.map(item => item.ville))];
          setVilles(uniqueVilles);
        }
      } catch (err) {
        showNotification('error', `Erreur dashboard: ${err.message}`);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchInitialData();
  }, [showNotification]);

  useEffect(() => {
    const fetchSuccursalesList = async () => {
      try {
        setLoadingTable(true);
        const params = new URLSearchParams();
        if (debouncedNomFilter) params.append('nomsuccursale', debouncedNomFilter);
        if (filters.ville) params.append('ville', filters.ville);
        
        const data = await succursaleService.getSuccursales(params);
        setSuccursales(data);
      } catch (err) {
        showNotification('error', `Erreur table: ${err.message}`);
      } finally {
        setLoadingTable(false);
      }
    };
    fetchSuccursalesList();
  }, [debouncedNomFilter, filters.ville, showNotification]);

  // --- HANDLERS ---
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleOpenAddModal = () => { setCurrentSuccursale(null); setIsModalOpen(true); };
  const handleOpenEditModal = (succursale) => { setCurrentSuccursale(succursale); setIsModalOpen(true); };
  const handleCancel = () => { setIsModalOpen(false); setCurrentSuccursale(null); };

  const handleExport = () => {
    if (!succursales || succursales.length === 0) {
      showNotification('error', "Aucune donnée à exporter.");
      return;
    }
    const headers = ['ID', 'Code Agence', 'Nom', 'Adresse 1', 'Adresse 2', 'Ville', 'Code Postal', 'Province', 'Pays', 'Téléphone'];
    const rows = succursales.map(s => [s.idsuccursale, s.codeagence, s.nomsuccursale, s.adresse1, s.adresse2, s.ville, s.codepostal, s.province, s.pays, s.telephone]);
    exportCSV(headers, rows);
    showNotification('success', 'Exportation CSV démarrée.');
  };

  const handleSubmit = async (data) => {
    const action = currentSuccursale ? 'mise à jour' : 'créée';
    try {
      if (currentSuccursale) {
        await succursaleService.updateSuccursale(currentSuccursale.idsuccursale, data);
      } else {
        await succursaleService.createSuccursale(data);
      }
      showNotification('success', `Succursale ${action} avec succès`);
      handleCancel();
      // Recharger les données pour voir les changements
      const params = new URLSearchParams();
      if (debouncedNomFilter) params.append('nomsuccursale', debouncedNomFilter);
      if (filters.ville) params.append('ville', filters.ville);
      const updatedData = await succursaleService.getSuccursales(params);
      setSuccursales(updatedData);
      return { success: true };
    } catch (err) {
      const errorBody = await err.json().catch(() => ({}));
      showNotification('error', errorBody.error || 'Une erreur est survenue.');
      return { errors: errorBody.errors || [] };
    }
  };

  
  
  // --- PRÉPARATION DES DONNÉES POUR LE GRAPHIQUE (CORRIGÉ) ---
  const vehiculesBySuccursaleChartData = useMemo(() => {
    if (!dashboardData?.vehiculesBySuccursale || dashboardData.vehiculesBySuccursale.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    return {
      labels: dashboardData.vehiculesBySuccursale.map(item => item.nomsuccursale),
      // --- CORRECTION : On formate les données avec un tableau `datasets` ---
      datasets: [{
        label: 'Nombre de véhicules',
        data: dashboardData.vehiculesBySuccursale.map(item => item.vehiculeCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      }],
    };
  }, [dashboardData]);

  // --- JSX (inchangé) ---
  return (
    <div className="space-y-8">
      {notification.show && (
        <div className={`fixed top-5 right-5 text-white px-4 py-2 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tableau de Bord des Succursales</h2>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Ajouter une succursale
        </button>
      </div>

      {loadingDashboard ? (
        <div className="text-center py-10">Chargement du tableau de bord...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <StatCard title="Total des Succursales" value={dashboardData?.succursales?.count || 0} icon={Building} />
            <StatCard title="Total des Véhicules" value={dashboardData?.vehicules?.total || 0} icon={Car} />
            <TopListCard 
              title="Top 3 par Réservations"
              items={dashboardData?.topSuccursalesByReservation || []}
              nameKey="nomsuccursale"
              valueKey="count"
              icon={BookMarked}
            />
          </div>
          <div className="lg:col-span-2">
            <BarChart 
              chartData={vehiculesBySuccursaleChartData} 
              title="Répartition des Véhicules par Succursale"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Liste des Agences</h3>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={16}/>
            Exporter en CSV
          </button>
        </div>
        
        <SuccursalesFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          villes={villes}
        />
        
        {loadingTable ? (
          <div className="text-center py-8">Mise à jour de la liste...</div>
        ) : (
          <SuccursalesTable
            succursales={succursales}
            onEdit={handleOpenEditModal}
           
          />
        )}
      </div>

      {isModalOpen && (
        <SuccursalesForm 
          initialData={currentSuccursale} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      )}
    </div>
  );
};

export default SuccursalesPage;
