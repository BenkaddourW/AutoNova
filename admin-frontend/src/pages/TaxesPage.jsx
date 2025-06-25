// src/pages/TaxesPage.jsx (Version Finale avec Normalisation des Données)

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as taxeService from '../services/taxeService';

import TaxesTable from '../components/TaxesTable';
import TaxesForm from '../components/TaxesForm';
import TaxesFilters from '../components/TaxesFilters';
import { useDebounce } from '../hooks/useDebounce';

const TaxesPage = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaxe, setCurrentTaxe] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const debouncedSearch = useDebounce(filters.search, 300);

  const loadTaxes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      const data = await taxeService.getTaxes(params);
      
      // ✅ NORMALISATION DES DONNÉES ICI
      // On s'assure que chaque objet 'taxe' a une structure cohérente
      const normalizedTaxes = data.map(taxe => ({
        ...taxe,
        // On crée des propriétés `pays` et `province` de premier niveau
        // pour que la table puisse les lire simplement.
        pays: taxe.localites?.[0]?.pays || '',
        province: taxe.localites?.[0]?.province || ''
      }));

      setTaxes(normalizedTaxes);

    } catch (err) {
      toast.error("Erreur lors de la récupération des taxes.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  const handleSubmit = async (data) => {
    const isEditing = !!currentTaxe;
    const action = isEditing 
      ? () => taxeService.updateTaxe(currentTaxe.idtaxe, data)
      : () => taxeService.createTaxe(data);
    
    const successMessage = isEditing ? 'Taxe mise à jour avec succès !' : 'Taxe créée avec succès !';
    const errorMessage = isEditing ? 'Erreur lors de la mise à jour.' : 'Erreur lors de la création.';

    try {
      await action();
      toast.success(successMessage);
      setIsModalOpen(false);
      setCurrentTaxe(null);
      loadTaxes(); // Rafraîchit la liste avec les nouvelles données normalisées
    } catch (error) {
      toast.error(error.message || errorMessage);
      return error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette taxe ?')) return;
    try {
      await taxeService.deleteTaxe(id);
      toast.success('Taxe supprimée avec succès.');
      loadTaxes(); // Rafraîchit la liste
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression.');
    }
  };

  const handleCreateClick = () => {
    setCurrentTaxe(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (taxe) => {
    setCurrentTaxe(taxe);
    setIsModalOpen(true);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentTaxe(null);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'clear') { setFilters({ search: '' }); } 
    else { setFilters(prev => ({ ...prev, [key]: value })); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Taxes</h1>
        <button onClick={handleCreateClick} className="btn btn-primary flex items-center">
          <Plus size={16} className="mr-2" /> Ajouter
        </button>
      </div>

      <TaxesFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></div>
      ) : (
        <TaxesTable taxes={taxes} onEdit={handleEditClick} onDelete={handleDelete} />
      )}

      {isModalOpen && (
        <TaxesForm
          initialData={currentTaxe}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TaxesPage;