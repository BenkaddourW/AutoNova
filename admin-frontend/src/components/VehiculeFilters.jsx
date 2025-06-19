import { Search, X } from 'lucide-react';

const VehiculeFilters = ({ filters, onFilterChange, options }) => {
  return (
    // La grille gère maintenant 5 colonnes sur les grands écrans
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      
      {/* Barre de recherche (prend 2 colonnes) */}
      <div className="relative lg:col-span-2">
        <label htmlFor="search" className="sr-only">Rechercher</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="search"
          placeholder="Rechercher par immat, marque, modèle..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input-style w-full pl-10"
        />
      </div>

      {/* Filtre par statut */}
      <div>
        <label htmlFor="statut" className="sr-only">Filtrer par statut</label>
        <select 
          id="statut"
          value={filters.statut || ''} 
          onChange={(e) => onFilterChange('statut', e.target.value)} 
          className="input-style w-full"
        >
          <option value="">Tous les statuts</option>
          {['disponible', 'en_location', 'en_maintenance', 'hors_service'].map(statut => (
            <option key={statut} value={statut}>{statut.charAt(0).toUpperCase() + statut.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Filtre par catégorie (RÉINTÉGRÉ) */}
      <div>
        <label htmlFor="categorie" className="sr-only">Filtrer par catégorie</label>
        <select 
          id="categorie"
          value={filters.categorie || ''} 
          onChange={(e) => onFilterChange('categorie', e.target.value)} 
          className="input-style w-full"
        >
          <option value="">Toutes les catégories</option>
          {/* On vérifie que `options.categories` existe avant de faire le map */}
          {options?.categories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      
      {/* Bouton Effacer */}
      <div>
        <button 
          onClick={() => onFilterChange('clear')} 
          className="btn-secondary w-full flex items-center justify-center gap-2"
          aria-label="Effacer tous les filtres"
        >
          <X size={16} />
          <span>Effacer</span>
        </button>
      </div>
    </div>
  );
};

export default VehiculeFilters;
