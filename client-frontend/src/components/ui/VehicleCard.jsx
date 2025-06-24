// src/components/ui/VehicleCard.jsx

import { Link } from 'react-router-dom';
import { Users, Gauge, GitBranch, Droplet, MapPin } from 'lucide-react';

const VehicleCard = ({ vehicle, searchDates, pickupLocationId }) => {
  const mainImage = vehicle.VehiculeImages?.find(img => img.estprincipale)?.urlimage || vehicle.VehiculeImages?.[0]?.urlimage || 'https://via.placeholder.com/400x300';
  const features = [
    { icon: <Users size={16} />, label: `${vehicle.sieges} sièges` },
     { icon: <Gauge size={16} />, label: vehicle.transmission },
    { icon: <Droplet size={16} />, label: vehicle.energie }, 
    { icon: <GitBranch size={16} />, label: vehicle.typeentrainement },
  ];
  return (
    <div className="card bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <figure><img src={mainImage} alt={`Image de ${vehicle.marque} ${vehicle.modele}`} className="h-56 w-full object-cover" /></figure>
      <div className="card-body p-4 flex flex-col">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.categorie}</p><h2 className="card-title text-lg font-bold text-slate-800 dark:text-white">{vehicle.marque} {vehicle.modele}</h2></div>
            <div className="text-right"><p className="text-2xl font-bold text-primary dark:text-white">${Number(vehicle.tarifjournalier).toFixed(2)}</p><p className="text-xs text-slate-500">/ jour</p></div>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin size={14} />
            <span>Disponible à : {vehicle.Succursale?.nomsuccursale || 'N/A'}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300 my-4">{features.map((feat, i) => (<div key={i} className="flex items-center gap-2">{feat.icon}<span>{feat.label}</span></div>))}</div>
        </div>
        <div className="card-actions justify-end mt-2">
          <Link to={`/vehicules/${vehicle.idvehicule}`} 
                state={{ 
                  initialDates: searchDates, 
                  // On passe l'ID de la recherche si elle existe, sinon l'ID de la succursale du véhicule
                  pickupLocationId: pickupLocationId || vehicle.succursaleidsuccursale 
                }} 
                className="btn btn-primary w-full">
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
};
export default VehicleCard;