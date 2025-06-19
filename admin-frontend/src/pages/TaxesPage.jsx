import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [filters, setFilters] = useState({ search: '' });
  const debouncedSearch = useDebounce(filters.search, 300);

  const loadTaxes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      const data = await taxeService.getTaxes(params);
      setTaxes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadTaxes(); }, [loadTaxes]);

  const handleCreate = () => {
    setCurrentTaxe(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (taxe) => {
    setCurrentTaxe(taxe);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentTaxe(null);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({ search: '' });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (currentTaxe) {
        await taxeService.updateTaxe(currentTaxe.idtaxe, data);
      } else {
        await taxeService.createTaxe(data);
      }
      setIsModalOpen(false);
      setCurrentTaxe(null);
      loadTaxes();
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette taxe ?')) return;
    try {
      await taxeService.deleteTaxe(id);
      loadTaxes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Taxes</h1>
        <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-sky-600 text-white rounded">
          <Plus size={16} className="mr-2" /> Ajouter
        </button>
      </div>

      <TaxesFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <TaxesTable taxes={taxes} onEdit={handleOpenEditModal} onDelete={handleDelete} />
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
