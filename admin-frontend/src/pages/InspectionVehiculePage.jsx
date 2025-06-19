import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import * as inspectionService from '../services/inspectionService';
import InspectionsTable from '../components/InspectionsTable';
import InspectionForm from '../components/InspectionForm';

const InspectionVehiculePage = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInspection, setCurrentInspection] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionService.getInspections();
      setInspections(data);
    } catch (err) {
      showNotification('error', err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleOpenAddModal = () => { setCurrentInspection(null); setIsModalOpen(true); };
  const handleOpenEditModal = (insp) => { setCurrentInspection(insp); setIsModalOpen(true); };
  const handleCancel = () => { setIsModalOpen(false); setCurrentInspection(null); };

  const handleSubmit = async (data) => {
    try {
      if (currentInspection) {
        await inspectionService.updateInspection(currentInspection.idinspection, data);
        showNotification('success', 'Inspection mise à jour');
      } else {
        await inspectionService.createInspection(data);
        showNotification('success', 'Inspection créée');
      }
      handleCancel();
      await loadInspections();
      return { success: true };
    } catch (error) {
      const errorBody = await error.json().catch(() => ({}));
      showNotification('error', errorBody.error || 'Une erreur est survenue');
      return { errors: errorBody.errors || [] };
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette inspection ?')) {
      try {
        await inspectionService.deleteInspection(id);
        showNotification('success', 'Inspection supprimée');
        await loadInspections();
      } catch (err) {
        showNotification('error', err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      {notification.show && (
        <div className={`fixed top-5 right-5 text-white px-4 py-2 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des Inspections</h2>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Ajouter une inspection
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <InspectionsTable
          inspections={inspections}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      )}

      {isModalOpen && (
        <InspectionForm
          initialData={currentInspection}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default InspectionVehiculePage;
