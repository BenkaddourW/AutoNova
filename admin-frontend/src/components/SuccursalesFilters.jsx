import { Search, X } from 'lucide-react';

const SuccursalesFilters = ({ filters, onFilterChange, villes }) => {
  const handleClear = () => {
    onFilterChange('nom', '');
    onFilterChange('ville', '');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
      {/* Champ de recherche par nom */}
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom d'agence..."
          value={filters.nom || ''}
          onChange={(e) => onFilterChange('nom', e.target.value)}
          className="input-style w-full pl-10"
        />
      </div>

      {/* Filtre par ville */}
      <div>
        <select
          value={filters.ville || ''}
          onChange={(e) => onFilterChange('ville', e.target.value)}
          className="input-style"
        >
          <option value="">Toutes les villes</option>
          {villes.map(ville => (
            <option key={ville} value={ville}>{ville}</option>
          ))}
        </select>
      </div>

      {/* Bouton pour effacer les filtres */}
      <button onClick={handleClear} className="btn-secondary flex items-center gap-2">
        <X size={16} />
        Effacer
      </button>
    </div>
  );
};

export default SuccursalesFilters;
