// src/pages/VehiclesPage.jsx (Version Finale Corrigée)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import VehicleCard from '../components/ui/VehicleCard';
import AdvancedSearchBar from '../components/AdvancedSearchBar';
import * as vehicleService from '../services/vehicleService';
import { toast } from 'react-hot-toast';
import { SlidersHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';

const initialRefineFilters = {
  categories: [], transmission: 'any', energie: 'any',
  typeEntrainement: 'any', sieges: 'any', prixMax: 500,
};

const initialSearchCriteria = {
  country: '', province: '', city: '', idsuccursale: '',
  make: 'any', dates: { from: undefined, to: undefined }
};

const VEHICLES_PER_PAGE = 9;

// Le composant RefinePanel reste inchangé, il fonctionne déjà bien.
const RefinePanel = ({ filters, setFilters, filterOptions, resetFilters }) => {
  const handleCheckboxChange = (e, filterKey) => {
    const { value, checked } = e.target;
    setFilters(prev => ({ ...prev, [filterKey]: checked ? [...prev[filterKey], value] : prev[filterKey].filter(item => item !== value) }));
  };
  return (
    <div className="space-y-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg md:shadow-none dark:text-slate-200">
      <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Affiner</h3><button onClick={resetFilters} className="text-sm link link-hover text-primary">Réinitialiser</button></div>
      <div><h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Catégorie</h4><div className="space-y-2 text-sm">{filterOptions.categories?.map(item => (<div key={item} className="flex items-center"><input type="checkbox" id={`cat-${item}`} value={item} checked={filters.categories.includes(item)} onChange={(e) => handleCheckboxChange(e, 'categories')} className="checkbox checkbox-sm checkbox-primary mr-2" /><label htmlFor={`cat-${item}`}>{item}</label></div>))}</div></div>
      <div className="divider my-0"></div>
      <div><h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Prix Maximum / jour</h4><input type="range" min="30" max="500" step="5" value={filters.prixMax} onChange={(e) => setFilters(f => ({ ...f, prixMax: Number(e.target.value) }))} className="range range-primary" /><div className="text-right font-semibold text-primary">{filters.prixMax} €</div></div>
      <div className="divider my-0"></div>
      <div><h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Nombre de sièges</h4><select className="select select-bordered w-full" value={filters.sieges} onChange={(e) => setFilters(f => ({ ...f, sieges: e.target.value }))}><option className="dark:text-black" value="any">Tous</option>{filterOptions.sieges?.sort((a,b) => a-b).map(s => (<option className="dark:text-black" key={s} value={s}>{s} sièges</option>))}</select></div>
      <div className="divider my-0"></div>
      <div><h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Transmission</h4><div className="join w-full"><button onClick={() => setFilters(f => ({...f, transmission: 'any'}))} className={`join-item btn btn-sm flex-1 ${filters.transmission === 'any' ? 'btn-primary' : ''}`}>Tout</button>{filterOptions.transmissions?.map(item => (<button key={item} onClick={() => setFilters(f => ({...f, transmission: item}))} className={`join-item btn btn-sm flex-1 ${filters.transmission === item ? 'btn-primary' : ''}`}>{item}</button>))}</div></div>
      <div className="divider my-0"></div>
      <div><h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Énergie</h4><select className="select select-bordered w-full" value={filters.energie} onChange={(e) => setFilters(f => ({ ...f, energie: e.target.value }))}><option className="dark:text-black" value="any">Toutes</option>{filterOptions.energies?.map(item => (<option className="dark:text-black" key={item} value={item}>{item}</option>))}</select></div>
      <div className="divider my-0"></div>
      <div><h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Type d'entraînement</h4><select className="select select-bordered w-full" value={filters.typeEntrainement} onChange={(e) => setFilters(f => ({ ...f, typeEntrainement: e.target.value }))}><option className="dark:text-black" value="any">Tous</option>{filterOptions.typesEntrainement?.map(item => (<option className="dark:text-black" key={item} value={item}>{item}</option>))}</select></div>
    </div>
  );
};

const VehiclesPage = () => {
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useState(location.state?.searchCriteria || initialSearchCriteria);
  const [vehicles, setVehicles] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState({});
  const [refineFilters, setRefineFilters] = useState(initialRefineFilters);
  const [sortOption, setSortOption] = useState('prix-asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const executeSearch = useCallback(async (page = 1) => {
    setIsSearching(true);
    setCurrentPage(page);
    try {
      // --- DÉBUT DE LA SECTION CORRIGÉE ---
      const searchParams = { 
        limit: VEHICLES_PER_PAGE, 
        offset: (page - 1) * VEHICLES_PER_PAGE 
      };

      // 1. Ajout des critères de recherche principaux
      if (searchCriteria.idsuccursale) {
        searchParams.idsuccursale = searchCriteria.idsuccursale;
      } else {
        if (searchCriteria.country) searchParams.pays = searchCriteria.country;
        if (searchCriteria.province) searchParams.province = searchCriteria.province;
        if (searchCriteria.city) searchParams.ville = searchCriteria.city;
      }
      if (searchCriteria.make && searchCriteria.make !== 'any') {
        searchParams.marque = searchCriteria.make;
      }
      if (searchCriteria.dates.from && searchCriteria.dates.to) {
        searchParams.datedebut = format(new Date(searchCriteria.dates.from), 'yyyy-MM-dd');
        searchParams.datefin = format(new Date(searchCriteria.dates.to), 'yyyy-MM-dd');
      }

      // 2. Ajout des filtres d'affinage (ICI LA CORRECTION COMPLÈTE)
      if (refineFilters.categories.length > 0) {
        searchParams.categories = refineFilters.categories.join(',');
      }
      if (refineFilters.transmission !== 'any') {
        searchParams.transmission = refineFilters.transmission;
      }
      if (refineFilters.energie !== 'any') {
        searchParams.energie = refineFilters.energie;
      }
      if (refineFilters.typeEntrainement !== 'any') {
        searchParams.typeEntrainement = refineFilters.typeEntrainement;
      }
      if (refineFilters.sieges !== 'any') {
        searchParams.sieges = refineFilters.sieges;
      }
      // On envoie le prix seulement s'il est inférieur au maximum
      if (refineFilters.prixMax < 500) {
        searchParams.prixMax = refineFilters.prixMax;
      }
      // --- FIN DE LA SECTION CORRIGÉE ---

      const response = await vehicleService.searchVehicles(searchParams);
      setVehicles(response.vehicles || []);
      setTotalVehicles(response.total || 0);
      // Ajoute ce log juste après avoir mis à jour les véhicules
console.log("Véhicules reçus :", response.vehicles);
if (response.vehicles) {
  response.vehicles.forEach(v =>
    console.log(`ID: ${v.idvehicule}, Images:`, v.VehiculeImages?.map(img => img.urlimage))
  );
}
    } catch (error) { 
      toast.error("La recherche a échoué: " + (error.message || "Erreur inconnue")); 
      setVehicles([]); 
      setTotalVehicles(0); 
    } finally { 
      setIsSearching(false); 
      setIsLoading(false); 
    }
  }, [searchCriteria, refineFilters]);

  useEffect(() => { 
    vehicleService.getFilterOptions().then(setFilterOptions); 
  }, []);

  useEffect(() => { 
    setIsLoading(true); 
    const handler = setTimeout(() => { 
      executeSearch(1); 
    }, 300);
    return () => clearTimeout(handler); 
  }, [searchCriteria, refineFilters, executeSearch]);

  const sortedVehicles = useMemo(() => {
    const sorted = [...vehicles];
    switch (sortOption) {
      case 'prix-asc': sorted.sort((a, b) => a.tarifjournalier - b.tarifjournalier); break;
      case 'prix-desc': sorted.sort((a, b) => b.tarifjournalier - a.tarifjournalier); break;
      case 'nom-asc': sorted.sort((a, b) => `${a.marque} ${a.modele}`.localeCompare(`${b.marque} ${b.modele}`)); break;
    }
    return sorted;
  }, [vehicles, sortOption]);

  const totalPages = Math.ceil(totalVehicles / VEHICLES_PER_PAGE);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8"><AdvancedSearchBar onSearch={setSearchCriteria} isSearching={isSearching} initialCriteria={searchCriteria} filterOptions={filterOptions} /></div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 hidden md:block"><div className="sticky top-24"><RefinePanel filters={refineFilters} setFilters={setRefineFilters} filterOptions={filterOptions} resetFilters={() => setRefineFilters(initialRefineFilters)} /></div></aside>
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6"><span className="text-sm text-slate-500">{totalVehicles} véhicule(s) trouvé(s)</span><div className="flex items-center gap-4"><select className="select select-bordered select-sm dark:text-black" value={sortOption} onChange={(e) => setSortOption(e.target.value)}><option className="dark:text-black" value="prix-asc">Trier par : Prix croissant</option><option className="dark:text-black" value="prix-desc">Trier par : Prix décroissant</option><option className="dark:text-black" value="nom-asc">Trier par : Nom (A-Z)</option></select><button className="btn btn-primary md:hidden" onClick={() => setIsFilterModalOpen(true)}><SlidersHorizontal size={16} /> Affiner</button></div></div>
          {isLoading ? (<div className="text-center py-10"><span className="loading loading-dots loading-lg"></span></div>) : sortedVehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVehicles.map(v => 
                  <VehicleCard 
                    key={v.idvehicule} 
                    vehicle={v} 
                    searchDates={searchCriteria.dates}
                    pickupLocationId={searchCriteria.idsuccursale}
                  />
                )}
              </div>
              {totalPages > 1 && (<div className="flex justify-center mt-12"><div className="join">{[...Array(totalPages).keys()].map(n => (<button key={n + 1} className={`join-item btn ${currentPage === n + 1 ? 'btn-active btn-primary' : 'btn-neutral'}`} onClick={() => executeSearch(n + 1)} disabled={isSearching}>{n + 1}</button>))}</div></div>)}
            </>
          ) : (<div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow"><h3 className="text-xl font-semibold">Aucun résultat</h3><p className="mt-2 text-slate-500">Aucun véhicule ne correspond à vos critères.</p></div>)}
        </main>
      </div>
      {isFilterModalOpen && (<div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFilterModalOpen(false)}><div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 z-50 overflow-y-auto p-4" onClick={e => e.stopPropagation()}><button onClick={() => setIsFilterModalOpen(false)} className="absolute top-2 right-2 btn btn-ghost btn-sm btn-circle"><X/></button><RefinePanel filters={refineFilters} setFilters={setRefineFilters} filterOptions={filterOptions} resetFilters={() => {setRefineFilters(initialRefineFilters); setIsFilterModalOpen(false);}} /></div></div>)}
    </div>
  );
};

export default VehiclesPage;
