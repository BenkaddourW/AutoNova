import { Search, X } from 'lucide-react';

const TaxesFilters = ({ filters, onFilterChange }) => {
  const handleClear = () => onFilterChange('clear');
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input-style w-full pl-10"
        />
      </div>
      <button onClick={handleClear} className="btn-secondary flex items-center gap-2">
        <X size={16} />
        Effacer
      </button>
    </div>
  );
};

export default TaxesFilters;
