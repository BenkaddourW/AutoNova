import { useState, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

const HeroSearchForm = () => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Recherche lancée :", { location, startDate, endDate });
  };

  // Si on choisit une nouvelle date de départ, on réinitialise la date de fin
  // si elle est antérieure à la nouvelle date de départ.
  const handleStartDateSelect = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm mt-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        
        {/* --- Champ Lieu --- */}
        <div className="lg:col-span-2">
          <label htmlFor="pickup-location" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Lieu de prise en charge
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="pickup-location" type="text" value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-style w-full pl-10 h-10"
              placeholder="Ville, aéroport, adresse..."
            />
          </div>
        </div>

        {/* --- Champ Date de Début --- */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Début de location
          </label>
          <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-10">
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${startDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {startDate ? format(startDate, 'dd MMM yyyy', { locale: fr }) : 'Date de début'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} /* ... transition props ... */ >
                  <Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    <DayPicker
                      mode="single" locale={fr} selected={startDate}
                      onSelect={(date) => { handleStartDateSelect(date); close(); }}
                      disabled={{ before: new Date() }}
                    />
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        
        {/* --- Champ Date de Fin --- */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Fin de location
          </label>
           <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-10" disabled={!startDate}>
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${endDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {endDate ? format(endDate, 'dd MMM yyyy', { locale: fr }) : 'Date de fin'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} /* ... transition props ... */ >
                  <Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    <DayPicker
                      mode="single" locale={fr} selected={endDate}
                      onSelect={(date) => { setEndDate(date); close(); }}
                      // On désactive toutes les dates AVANT la date de départ
                      disabled={{ before: startDate || new Date() }}
                    />
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>

        {/* --- Bouton de Recherche --- */}
        <div className="lg:col-span-4 mt-4">
          <button type="submit" className="btn-primary w-full h-12 flex items-center justify-center text-lg">
            Rechercher un véhicule
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSearchForm;