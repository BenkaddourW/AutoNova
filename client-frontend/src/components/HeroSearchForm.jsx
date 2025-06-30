// src/components/HeroSearchForm.jsx (Version Finale avec Calendrier Corrigé)

import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, Transition } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Calendar, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as vehicleService from '../services/vehicleService';

const HeroSearchForm = () => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !startDate || !endDate) {
      toast.error("Veuillez remplir le lieu et les deux dates.");
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading('Recherche des véhicules disponibles...');
    try {
      const response = await vehicleService.searchVehicles({
          location: location,
          datedebut: format(startDate, 'yyyy-MM-dd'),
          datefin: format(endDate, 'yyyy-MM-dd'),
      });
      toast.dismiss(loadingToast);
      
      const availableVehicles = response.vehicles || [];
      const totalVehicles = response.total || 0;

      if (totalVehicles === 0) {
        toast("Désolé, aucun véhicule n'est disponible pour ces critères.", { duration: 4000 });
      } else {
        toast.success(`${totalVehicles} véhicule(s) trouvé(s) !`);
        // On passe les critères de recherche à la page suivante
        navigate('/vehicules', { 
            state: { 
                searchCriteria: {
                    city: location,
                    dates: {
                        from: startDate,
                        to: endDate
                    }
                }
             } 
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Une erreur est survenue lors de la recherche.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartDateSelect = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };
  
  // ✅ DÉFINITION DES CLASSES DE STYLE POUR LE CALENDRIER
  const calendarClassNames = {
    root: 'p-3',
    caption: 'flex justify-center items-center relative text-sm pt-1 pb-2',
    caption_label: 'font-semibold text-slate-900 dark:text-slate-100',
    nav: 'space-x-1 flex items-center',
    nav_button: 'h-7 w-7 bg-transparent p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
    table: 'w-full border-collapse space-y-1 mt-2',
    head_row: 'flex',
    head_cell: 'text-slate-500 dark:text-slate-400 rounded-md w-9 font-normal text-[0.8rem]',
    row: 'flex w-full mt-2',
    cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary rounded-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-800 dark:text-slate-200',
    day_selected: 'bg-primary text-primary-content hover:bg-primary/90 focus:bg-primary focus:text-primary-content',
    day_today: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100',
    day_outside: 'text-slate-400 dark:text-slate-500 opacity-50',
    day_disabled: 'text-slate-400 dark:text-slate-600 opacity-50',
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm mt-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="md:col-span-2 lg:col-span-2">
          <label htmlFor="pickup-location" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Lieu de prise en charge</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input id="pickup-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-style w-full pl-10 h-12" placeholder="Ville"/>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Début de location</label>
          <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-12">
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${startDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {startDate ? format(startDate, 'dd MMM yyyy', { locale: fr }) : 'Date de début'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel static className="absolute z-20 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    {/* ✅ APPLICATION DES CLASSES DE STYLE AU CALENDRIER */}
                    <DayPicker mode="single" locale={fr} selected={startDate} onSelect={(date) => { handleStartDateSelect(date); close(); }} disabled={{ before: new Date() }} classNames={calendarClassNames} />
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fin de location</label>
          <Popover className="relative">
            {({ open, close }) => (
              <>
                <Popover.Button className="input-style w-full flex items-center justify-between text-left h-12" disabled={!startDate}>
                  <Calendar className="mr-2 h-5 w-5 text-slate-400" />
                  <span className={`truncate ${endDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {endDate ? format(endDate, 'dd MMM yyyy', { locale: fr }) : 'Date de fin'}
                  </span>
                </Popover.Button>
                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel static className="absolute z-20 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
                    {/* ✅ APPLICATION DES CLASSES DE STYLE AU CALENDRIER */}
                    <DayPicker mode="single" locale={fr} selected={endDate} onSelect={(date) => { setEndDate(date); close(); }} disabled={{ before: startDate || new Date() }} classNames={calendarClassNames} />
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        <div className="lg:col-span-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 flex items-center justify-center text-lg gap-2">
            <Search size={20} />
            {isSubmitting ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSearchForm;

