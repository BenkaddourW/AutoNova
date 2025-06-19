// Fichier : dashboard-frontend/src/pages/ContratInspectionPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as inspectionService from '../services/inspectionService';
import InspectionForm from '../components/InspectionForm';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

// Le composant pour afficher le résumé de l'inspection de départ
const InspectionDepartSummary = ({ inspection }) => {
  if (!inspection) return null;
  return (
    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-600">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><CheckCircle size={20} className="text-green-500" /> Inspection de Départ (Référence)</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <p><strong>Date:</strong> {new Date(inspection.dateinspection).toLocaleDateString()}</p>
        <p><strong>Kilométrage:</strong> {inspection.kilometrage.toLocaleString()} km</p>
        <p><strong>Carburant:</strong> {inspection.niveaucarburant}</p>
        <p><strong>Propreté:</strong> {inspection.proprete ? 'Oui' : 'Non'}</p>
        <p className="col-span-2"><strong>Notes:</strong> {inspection.note || 'Aucune'}</p>
      </div>
      {inspection.InspectionImages && inspection.InspectionImages.length > 0 && (
        <div className="mt-4">
          <p className="font-bold text-sm mb-2">Photos de départ :</p>
          <div className="flex gap-2 flex-wrap">
            {inspection.InspectionImages.map(img => (
              <a key={img.idimage} href={img.urlimage} target="_blank" rel="noopener noreferrer">
                <img src={img.urlimage} alt="Inspection de départ" className="w-24 h-24 object-cover rounded-md border-2 border-transparent hover:border-sky-500 transition" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const ContratInspectionPage = () => {
  const { idcontrat } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectionDepart, setInspectionDepart] = useState(null);
  
  // NOTE : Pour une version complète, vous récupéreriez aussi les détails du contrat ici pour obtenir le vrai idvehicule.
  const [prefilledData] = useState({
    idcontrat: parseInt(idcontrat, 10),
    idvehicule: 2, // Exemple: à remplacer par le vrai ID du véhicule du contrat
  });

  useEffect(() => {
    const loadInspectionData = async () => {
      try {
        setLoading(true);
        const inspections = await inspectionService.getInspectionsByContratId(idcontrat);
        const depart = inspections.find(insp => insp.typeinspection?.toUpperCase() === 'DEPART');
        setInspectionDepart(depart || null);
      } catch (err) {
        setError("Impossible de charger les données d'inspection pour ce contrat.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInspectionData();
  }, [idcontrat]);

  const handleSubmit = async (formData) => {
    try {
      const isRetour = !!inspectionDepart; // On est en mode retour s'il y a une inspection de départ
      const type = isRetour ? 'RETOUR' : 'DEPART';
      
      const dataToSubmit = {
        ...formData,
        ...prefilledData,
        typeinspection: type,
        dateinspection: new Date(formData.dateinspection).toISOString(),
        proprete: formData.proprete === 'true' || formData.proprete === true,
      };

      await inspectionService.createInspection(dataToSubmit);
      alert(`L'inspection de ${type.toLowerCase()} a été enregistrée avec succès !`);
      navigate('/contrats'); // Redirige vers la liste des contrats
    } catch (err) {
      alert("Une erreur est survenue lors de l'enregistrement de l'inspection.");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-10">Chargement...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  const isRetour = !!inspectionDepart;
  
  // --- CORRECTION CLÉ : On prépare les données pour le formulaire ---
  // On ne lui passe que les données pré-remplies, PAS l'inspection de départ complète.
  const formInitialData = {
    ...prefilledData,
    typeinspection: isRetour ? 'RETOUR' : 'DEPART',
    images: [], // On commence toujours avec un uploader d'images vide
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200">
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Inspection pour le Contrat #{idcontrat}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          {isRetour ? "Veuillez documenter l'état du véhicule au retour." : "Veuillez documenter l'état du véhicule au départ."}
        </p>

        {isRetour && <InspectionDepartSummary inspection={inspectionDepart} />}
        
        {!isRetour && !inspectionDepart && !loading && (
             <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <p>Prêt à commencer l'inspection de départ.</p>
            </div>
        )}

        <InspectionForm
          key={isRetour ? 'retour' : 'depart'}
          // On passe nos données initiales préparées
          initialData={formInitialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default ContratInspectionPage;
