import { Link } from 'react-router-dom';
import { Users, Gauge, GitBranch } from 'lucide-react';

const VehicleCard = ({ vehicle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden group transition-transform duration-300 hover:-translate-y-1">
    <Link to={`/vehicules/${vehicle.id}`}>
      <img src={vehicle.imageUrl} alt={`${vehicle.marque} ${vehicle.modele}`} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{vehicle.marque} {vehicle.modele}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.categorie}</p>
        <div className="flex justify-between items-center mt-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><Users size={16} /> {vehicle.sieges}</span>
          <span className="flex items-center gap-1"><Gauge size={16} /> {vehicle.transmission}</span>
          <span className="flex items-center gap-1"><GitBranch size={16} /> {vehicle.energie}</span>
        </div>
        <div className="mt-4 text-right">
          <p className="text-sm">à partir de</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{vehicle.tarif}€<span className="text-sm font-normal text-slate-500">/jour</span></p>
        </div>
      </div>
    </Link>
  </div>
);

export default VehicleCard;
