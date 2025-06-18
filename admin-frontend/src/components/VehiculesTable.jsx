import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const StatutBadge = ({ statut }) => {
  const statutColors = {
    disponible: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    en_location: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    en_maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    hors_service: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  const formattedStatut = (statut || '').charAt(0).toUpperCase() + statut.slice(1).replace('_', ' ');
  return (<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statutColors[statut] || 'bg-slate-200'}`}>{formattedStatut}</span>);
};

const getImageUrl = (vehicule) => {
  if (!vehicule.VehiculeImages || vehicule.VehiculeImages.length === 0) return null;
  // const mainImage = vehicule.VehiculeImages.find(img => img.estPrincipale);
  // return mainImage ? mainImage.urlImage : vehicule.VehiculeImages[0].urlImage;
  const mainImage = vehicule.VehiculeImages.find(img => img.estprincipale);
  return mainImage ? mainImage.urlimage : vehicule.VehiculeImages[0].urlimage;
};

const VehiculesTable = ({ vehicules, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
        <tr>
          <th className="px-4 py-3">Image</th>
          <th className="px-6 py-3">Véhicule</th>
          <th className="px-6 py-3">Immatriculation</th>
          <th className="px-6 py-3">Catégorie</th>
          <th className="px-6 py-3">ID Succ.</th>
          <th className="px-6 py-3 text-right">Tarif / jour</th>
          <th className="px-6 py-3 text-center">Statut</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {vehicules.length === 0 ? (
          <tr><td colSpan="8" className="text-center py-8 text-slate-500 italic">Aucun véhicule trouvé.</td></tr>
        ) : (
          vehicules.map((v) => {
            const imageUrl = getImageUrl(v);
            return (
              <tr key={v.idvehicule} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <td className="px-4 py-2">
                  {imageUrl ? (
                    <img src={imageUrl} alt={`Image de ${v.marque}`} className="w-20 h-12 object-cover rounded-md shadow-sm" />
                  ) : (
                    <div className="w-20 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                  <div className="font-bold">{v.marque}</div>
                  <div className="text-xs text-slate-500">{v.modele}</div>
                </td>
                <td className="px-6 py-4 font-mono">{v.immatriculation}</td>
                <td className="px-6 py-4">{v.categorie}</td>
                <td className="px-6 py-4 text-center font-mono">{v.succursaleidsuccursale}</td>
                <td className="px-6 py-4 text-right font-mono">{parseFloat(v.tarifjournalier).toFixed(2)} €</td>
                <td className="px-6 py-4 text-center"><StatutBadge statut={v.statut} /></td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit(v)} className="p-1 text-sky-600 hover:text-sky-800" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => onDelete(v.idvehicule)} className="p-1 text-red-600 hover:text-red-800" title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

export default VehiculesTable;