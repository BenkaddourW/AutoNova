import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Car, Wrench, CalendarCheck, CircleOff, Download, CarFront } from 'lucide-react';

// --- Services ---
import * as vehiculeService from '../services/vehiculeService';

// --- Composants ---
import VehiculesTable from '../components/VehiculesTable';
import VehiculeForm from '../components/VehiculeForm';
import StatCard from '../components/StatCard';
import VehiculeFilters from '../components/VehiculeFilters';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import Pagination from '../components/Pagination';

// --- Hooks ---
import { useDebounce } from '../hooks/useDebounce';
import { useCSVExport } from '../hooks/useCSVExport';

const VehiculesPage = () => {
  // --- ÉTATS (inchangés) ---
  const [vehicules, setVehicules] = useState([]);
  const [totalVehicules, setTotalVehicules] = useState(0);
  const [vehiculeStats, setVehiculeStats] = useState(null);
  const [statsByMarque, setStatsByMarque] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ marques: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', statut: '', categorie: '' });
  const debouncedFilters = useDebounce(filters, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicule, setCurrentVehicule] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const exportCSV = useCSVExport('export_vehicules.csv');

  // --- ÉTATS DE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Taille de page fixe

  // --- LOGIQUE DE FETCH (MODIFIÉE POUR LA PAGINATION) ---
  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedFilters.search) params.append('search', debouncedFilters.search); 
      if (debouncedFilters.statut) params.append('statut', debouncedFilters.statut);
      if (debouncedFilters.categorie) params.append('categorie', debouncedFilters.categorie);
      
      // Ajout des paramètres de pagination
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());
      
      const [statsData, vehiculesResponse, optionsData, marqueData] = await Promise.all([
        vehiculeService.getVehiculeGeneralStats(),
        vehiculeService.getVehicules(params),
        vehiculeService.getVehiculeFilterOptions(),
        vehiculeService.getVehiculeStatsByMarque(),
      ]);

      setVehiculeStats(statsData);
      setVehicules(vehiculesResponse.vehicules || []);
      setTotalVehicules(vehiculesResponse.total || 0);
      setFilterOptions(optionsData);
      setStatsByMarque(marqueData);
      
    } catch (err) {
      showNotification('error', `Erreur de chargement des données: ${err.message || 'Service indisponible'}`);
      setVehicules([]);
      setStatsByMarque([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, currentPage, pageSize]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // --- PRÉPARATION DES DONNÉES POUR LES GRAPHIQUES (MODIFIÉ) ---
  const statusChartData = useMemo(() => {
    if (!vehiculeStats) {
      // On renvoie une structure valide et vide pour éviter les crashs
      return { labels: [], datasets: [{ data: [] }] };
    }
    // CORRECTION : On enveloppe les données dans un tableau `datasets`
    return {
      labels: ['Disponibles', 'En location', 'En maintenance', 'Hors service'],
      datasets: [{
        label: 'Statut des véhicules',
        data: [
          vehiculeStats.disponibles || 0,
          vehiculeStats.en_location || 0,
          vehiculeStats.en_maintenance || 0,
          vehiculeStats.hors_service || 0,
        ],
        backgroundColor: [ // Couleurs pour le Pie Chart
          'rgba(74, 222, 128, 0.7)',  // Vert
          'rgba(56, 189, 248, 0.7)',  // Bleu ciel
          'rgba(250, 204, 21, 0.7)',   // Jaune
          'rgba(248, 113, 113, 0.7)'   // Rouge
        ],
        borderColor: '#ffffff', // Bordure blanche entre les segments
        borderWidth: 2,
      }],
    };
  }, [vehiculeStats]);

  const marqueChartData = useMemo(() => {
    if (!statsByMarque || statsByMarque.length === 0) {
      // On renvoie une structure valide et vide
      return { labels: [], datasets: [{ data: [] }] };
    }
    // CORRECTION : On enveloppe les données dans un tableau `datasets`
    return {
      labels: statsByMarque.map(item => item.marque),
      datasets: [{
        label: 'Nombre de véhicules',
        data: statsByMarque.map(item => parseInt(item.count, 10)),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      }],
    };
  }, [statsByMarque]);

  // --- HANDLERS (inchangés) ---
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };
  
  // --- HANDLER DE PAGINATION ---
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // --- HANDLER DE FILTRES (MODIFIÉ POUR RÉINITIALISER LA PAGE) ---
  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({ search: '', statut: '', categorie: '' });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    // Réinitialiser à la première page lors du changement de filtre
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (vehicules.length === 0) return showNotification('error', "Aucun véhicule à exporter.");
    const headers = ['ID', 'Marque', 'Modèle', 'Immatriculation', 'Statut', 'Kilométrage', 'Tarif Journalier'];
    const rows = vehicules.map(v => [v.idvehicule, v.marque, v.modele, v.immatriculation, v.statut, v.kilometrage, v.tarifjournalier]);
    exportCSV(headers, rows);
    showNotification('success', 'Exportation CSV démarrée.');
  };

  const handleSubmit = async (data) => {
    try {
      if (currentVehicule) {
        await vehiculeService.updateVehicule(currentVehicule.idvehicule, data);
        showNotification('success', 'Véhicule mis à jour avec succès.');
      } else {
        await vehiculeService.createVehicule(data);
        showNotification('success', 'Véhicule créé avec succès.');
      }
      handleCancel();
      await loadPageData();
      return { success: true };
    } catch (error) {
      const errorBody = await error.json().catch(() => ({}));
      showNotification('error', errorBody.error || 'Une erreur est survenue.');
      return { errors: errorBody.errors || [] };
    }
  };

  

  const handleOpenAddModal = () => { setCurrentVehicule(null); setIsModalOpen(true); };
  const handleOpenEditModal = (vehicule) => { setCurrentVehicule(vehicule); setIsModalOpen(true); };
  const handleCancel = () => { setIsModalOpen(false); setCurrentVehicule(null); };

  // --- JSX (inchangé) ---
  return (
    <div className="space-y-8">
      {notification.show && (
        <div className={`fixed top-5 right-5 text-white px-4 py-2 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion de la Flotte de Véhicules</h2>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Ajouter un véhicule
        </button>
      </div>

      {loading && !vehiculeStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Total" value={vehiculeStats?.total || 0} icon={Car} />
            <StatCard title="Disponibles" value={vehiculeStats?.disponibles || 0} icon={CalendarCheck} />
            <StatCard title="En Location" value={vehiculeStats?.en_location || 0} icon={CarFront} />
            <StatCard title="En Maintenance" value={vehiculeStats?.en_maintenance || 0} icon={Wrench} />
            <StatCard title="Hors Service" value={vehiculeStats?.hors_service || 0} icon={CircleOff} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart chartData={statusChartData} title="Répartition des Véhicules par Statut" />
            <BarChart chartData={marqueChartData} title="Top 5 des Marques dans la Flotte" />
          </div>
        </>
      )}
      
      <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-xl font-semibold">Liste des Véhicules</h3>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                <Download size={16}/>
                Exporter en CSV
            </button>
        </div>
        <VehiculeFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          options={filterOptions}
        />
        {loading ? (
          <div className="text-center py-8">Chargement de la liste...</div>
        ) : (
          <>
            <VehiculesTable
              vehicules={vehicules}
              onEdit={handleOpenEditModal}
              currentPage={currentPage}
              pageSize={pageSize}
            />
            <Pagination
              page={currentPage}
              total={totalVehicules}
              pageSize={pageSize}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>

      {isModalOpen && <VehiculeForm initialData={currentVehicule} onSubmit={handleSubmit} onCancel={handleCancel} />}
    </div>
  );
};

export default VehiculesPage;
