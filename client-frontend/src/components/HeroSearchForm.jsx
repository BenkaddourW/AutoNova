// src/components/HeroSearchForm.jsx

import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, Transition } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Calendar, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import des services API
import * as vehicleService from '../services/vehicleService';
import * as reservationService from '../services/reservationService';

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
      // Étape 1: Récupérer tous les véhicules
      const allVehicles = await vehicleService.getVehicles();
      if (!allVehicles || allVehicles.length === 0) {
        throw new Error("Aucun véhicule n'a été trouvé dans notre système.");
      }
      const vehicleIds = allVehicles.map(v => v.idvehicule);

      // Étape 2: Préparer et appeler la vérification de disponibilité
      const availabilityData = {
        idsvehicules: vehicleIds,
        datedebut: format(startDate, 'yyyy-MM-dd'),
        datefin: format(endDate, 'yyyy-MM-dd'),
      };
      const { disponibles } = await reservationService.checkAvailability(availabilityData);
      
      // Étape 3: Filtrer la liste des véhicules pour ne garder que ceux qui sont disponibles
      const availableVehicles = allVehicles.filter(v => disponibles.includes(v.idvehicule));
      
      toast.dismiss(loadingToast);

      if (availableVehicles.length === 0) {
        toast.info("Désolé, aucun véhicule n'est disponible pour ces dates.", { duration: 4000 });
      } else {
        toast.success(`${availableVehicles.length} véhicule(s) trouvé(s) !`);
        // Rediriger vers la page des véhicules en passant les résultats et les dates de recherche
        navigate('/vehicules', { 
            state: { 
                searchResults: availableVehicles,
                searchDates: {
                    from: startDate.toISOString(),
                    to: endDate.toISOString()
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

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm mt-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        <div className="md:col-span-2 lg:col-span-2">
          <label htmlFor="pickup-location" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Lieu de prise en charge</label>
          <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input id="pickup-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-style w-full pl-10 h-12" placeholder="Ville, aéroport, adresse..."/></div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Début de location</label>
          <Popover className="relative">{({ open, close }) => (<><Popover.Button className="input-style w-full flex items-center justify-between text-left h-12"><Calendar className="mr-2 h-5 w-5 text-slate-400" /><span className={`truncate ${startDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{startDate ? format(startDate, 'dd MMM yyyy', { locale: fr }) : 'Date de début'}</span></Popover.Button><Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1"><Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"><DayPicker mode="single" locale={fr} selected={startDate} onSelect={(date) => { handleStartDateSelect(date); close(); }} disabled={{ before: new Date() }} /></Popover.Panel></Transition></>)}</Popover>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fin de location</label>
          <Popover className="relative">{({ open, close }) => (<><Popover.Button className="input-style w-full flex items-center justify-between text-left h-12" disabled={!startDate}><Calendar className="mr-2 h-5 w-5 text-slate-400" /><span className={`truncate ${endDate ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{endDate ? format(endDate, 'dd MMM yyyy', { locale: fr }) : 'Date de fin'}</span></Popover.Button><Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1"><Popover.Panel static className="absolute z-20 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"><DayPicker mode="single" locale={fr} selected={endDate} onSelect={(date) => { setEndDate(date); close(); }} disabled={{ before: startDate || new Date() }} /></Popover.Panel></Transition></>)}</Popover>
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
