// Fichier : src/components/AdvancedSearchBar.jsx (Version finale avec Succursale)

import { useState, useEffect, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import * as succursaleService from '../services/succursaleService';

const LocationSelector = ({ location, setLocation }) => {
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [succursales, setSuccursales] = useState([]);
  const [loading, setLoading] = useState({ countries: true, provinces: false, cities: false, succursales: false });

  // 1. Charger les pays au montage
  useEffect(() => {
    succursaleService.getCountries()
      .then(data => setCountries(data))
      .catch(console.error)
      .finally(() => setLoading(prev => ({ ...prev, countries: false })));
  }, []);

  // 2. Charger les provinces quand un pays est sélectionné
  useEffect(() => {
    if (location.country) {
      setLoading(prev => ({ ...prev, provinces: true }));
      succursaleService.getProvinces(location.country)
        .then(data => setProvinces(data))
        .catch(console.error)
        .finally(() => setLoading(prev => ({ ...prev, provinces: false })));
    } else {
      setProvinces([]);
      setCities([]);
      setSuccursales([]);
    }
  }, [location.country]);

  // 3. Charger les villes quand une province est sélectionnée
  useEffect(() => {
    if (location.country && location.province) {
      setLoading(prev => ({ ...prev, cities: true }));
      succursaleService.getCities(location.country, location.province)
        .then(data => setCities(data))
        .catch(console.error)
        .finally(() => setLoading(prev => ({ ...prev, cities: false })));
    } else {
      setCities([]);
      setSuccursales([]);
    }
  }, [location.country, location.province]);

  // 4. Charger les succursales quand une ville est sélectionnée
  useEffect(() => {
    if (location.country && location.province && location.city) {
      setLoading(prev => ({ ...prev, succursales: true }));
      succursaleService.getSuccursalesByLocation(location.country, location.province, location.city)
        .then(data => setSuccursales(data))
        .catch(console.error)
        .finally(() => setLoading(prev => ({ ...prev, succursales: false })));
    } else {
      setSuccursales([]);
    }
  }, [location.country, location.province, location.city]);


  // Handlers pour mettre à jour l'état dans le composant parent
  const handleCountryChange = (e) => {
    setLocation({ country: e.target.value, province: '', city: '', idsuccursale: '' });
  };
  const handleProvinceChange = (e) => {
    setLocation({ province: e.target.value, city: '', idsuccursale: '' });
  };
  const handleCityChange = (e) => {
    setLocation({ city: e.target.value, idsuccursale: '' });
  };
  const handleSuccursaleChange = (e) => {
    setLocation({ idsuccursale: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Pays</label>
        <select className="select select-bordered w-full" value={location.country} onChange={handleCountryChange} disabled={loading.countries}>
          <option value="">{loading.countries ? 'Chargement...' : 'Choisir'}</option>
          {countries?.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Province/Région</label>
        <select className="select select-bordered w-full" value={location.province} onChange={handleProvinceChange} disabled={!location.country || loading.provinces}>
          <option value="">{loading.provinces ? 'Chargement...' : 'Choisir'}</option>
          {provinces?.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Ville</label>
        <select className="select select-bordered w-full" value={location.city} onChange={handleCityChange} disabled={!location.province || loading.cities}>
          <option value="">{loading.cities ? 'Chargement...' : 'Choisir'}</option>
          {cities?.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Succursale</label>
        <select className="select select-bordered w-full" value={location.idsuccursale} onChange={handleSuccursaleChange} disabled={!location.city || loading.succursales}>
          <option value="">{loading.succursales ? 'Chargement...' : 'Toutes les succursales'}</option>
          {succursales?.map(s => <option key={s.idsuccursale} value={s.idsuccursale}>{s.nomsuccursale}</option>)}
        </select>
      </div>
    </div>
  );
};


const AdvancedSearchBar = ({ onSearch, isSearching, initialCriteria, filterOptions }) => {
  const [criteria, setCriteria] = useState(initialCriteria);
  
  useEffect(() => {
    setCriteria(initialCriteria);
  }, [initialCriteria]);

  const handleStartDateSelect = (date, close) => {
    const newDates = { ...criteria.dates, from: date };
    if (criteria.dates.to && date > criteria.dates.to) {
      newDates.to = undefined;
    }
    setCriteria(c => ({...c, dates: newDates}));
    close();
  };

  const handleEndDateSelect = (date, close) => {
    setCriteria(c => ({...c, dates: {...c.dates, to: date}}));
    close();
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-4">
      {/* Ligne 1: Champs de localisation */}
      <div>
        <LocationSelector 
          location={{ 
              country: criteria.country, 
              province: criteria.province, 
              city: criteria.city, 
              idsuccursale: criteria.idsuccursale 
          }}
          setLocation={(loc) => setCriteria(c => ({ ...c, ...loc }))}
        />
      </div>
      
      {/* Ligne 2: Autres filtres et bouton de recherche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Marque</label>
          <select 
            className="select select-bordered w-full" 
            value={criteria.make} 
            onChange={e => setCriteria(c => ({...c, make: e.target.value}))}
          >
            <option value="any">Toutes les marques</option>
            {filterOptions.marques?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Début de location</label>
          <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-12">
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${criteria.dates.from ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {criteria.dates.from ? format(criteria.dates.from, 'dd MMM yyyy', { locale: fr }) : 'Date de début'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    <DayPicker mode="single" locale={fr} selected={criteria.dates.from} onSelect={(date) => handleStartDateSelect(date, close)} disabled={{ before: new Date() }}/>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Fin de location</label>
          <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-12" disabled={!criteria.dates.from}>
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${criteria.dates.to ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {criteria.dates.to ? format(criteria.dates.to, 'dd MMM yyyy', { locale: fr }) : 'Date de fin'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    <DayPicker mode="single" locale={fr} selected={criteria.dates.to} onSelect={(date) => handleEndDateSelect(date, close)} disabled={{ before: criteria.dates.from || new Date() }}/>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        <div>
          <button className="btn btn-primary w-full" onClick={() => onSearch(criteria)} disabled={isSearching}>
            {isSearching ? <span className="loading loading-spinner"></span> : "Rechercher"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchBar;
