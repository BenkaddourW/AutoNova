// src/components/ReservationSidebar.jsx (Version Finale avec Adresses Complètes)

import { useState, useEffect } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar } from 'lucide-react';

// Un petit composant pour formater l'adresse et éviter la répétition
const formatAddress = (succursale) => {
  if (!succursale) return 'Adresse non disponible';
  return `${succursale.adresse1}, ${succursale.ville}, ${succursale.codepostal}`;
};

const ReservationSidebar = ({ vehicle, succursales = [], initialDates }) => {
  const { user } = useAuth();
  
  const [startDate, setStartDate] = useState(initialDates?.from ? new Date(initialDates.from) : null);
  const [endDate, setEndDate] = useState(initialDates?.to ? new Date(initialDates.to) : null);
  const [numberOfDays, setNumberOfDays] = useState(0);

  const [returnLocationId, setReturnLocationId] = useState('');

  // L'objet complet de la succursale de retour, mis à jour quand on change la sélection
  const [selectedReturnSuccursale, setSelectedReturnSuccursale] = useState(null);

  useEffect(() => {
    if (vehicle?.Succursale) {
      // On initialise l'ID de retour avec celui de départ
      setReturnLocationId(vehicle.succursaleidsuccursale);
      // On initialise aussi l'objet complet de la succursale de retour
      setSelectedReturnSuccursale(vehicle.Succursale);
    }
  }, [vehicle]);

  useEffect(() => {
    // Met à jour l'objet de la succursale de retour quand l'ID change
    const newReturnLocation = succursales.find(s => s.idsuccursale === Number(returnLocationId));
    setSelectedReturnSuccursale(newReturnLocation);
  }, [returnLocationId, succursales]);

  useEffect(() => {
    if (startDate && endDate && startDate < endDate) {
      setNumberOfDays(differenceInCalendarDays(endDate, startDate));
    } else {
      setNumberOfDays(0);
    }
  }, [startDate, endDate]);

  const tarifAsNumber = Number(vehicle.tarifjournalier || 0);
  const totalPrice = numberOfDays * tarifAsNumber;

  const handleBooking = () => { /* ... (logique inchangée) ... */ };

  return (
    <div className="sticky top-24">
      <div className="card bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="card-body p-6">
          <h3 className="card-title text-xl text-slate-800 dark:text-white mb-4">Détails de la réservation</h3>
          
          <div className="space-y-4">
            {/* ✅ 1. AFFICHAGE DE L'ADRESSE DE DÉPART COMPLÈTE */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Adresse de départ</label>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{vehicle.Succursale?.nomsuccursale}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatAddress(vehicle.Succursale)}</p>
              </div>
            </div>

            {/* ✅ 2. MENU DÉROULANT POUR L'ADRESSE DE RETOUR */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Adresse de retour</label>
              <select 
                className="select select-bordered w-full" 
                value={returnLocationId} 
                onChange={(e) => setReturnLocationId(e.target.value)}
              >
                {succursales.map(s => (
                  <option className="dark:text-black" key={s.idsuccursale} value={s.idsuccursale}>
                    {s.nomsuccursale}
                  </option>
                ))}
              </select>
              {/* ✅ 3. AFFICHAGE CONDITIONNEL DE L'ADRESSE DE RETOUR SÉLECTIONNÉE */}
              {selectedReturnSuccursale && (
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-1">
                   {formatAddress(selectedReturnSuccursale)}
                 </p>
              )}
            </div>
          </div>

          <div className="divider my-4"></div>
          {/* ... (Le reste du composant pour les dates et le prix reste inchangé) ... */}
          <div className="space-y-2">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prise en charge</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{startDate ? format(startDate, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Retour</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{endDate ? format(endDate, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
          </div>
          <div className="divider my-4"></div>
          <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Prix par jour</span><span className="font-semibold text-slate-700 dark:text-slate-200">${tarifAsNumber.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-slate-500">Nombre de jours</span><span className="font-semibold text-slate-700 dark:text-slate-200">{numberOfDays}</span></div></div>
          <div className="divider my-4"></div>
          <div className="flex justify-between items-center"><span className="text-lg font-bold text-slate-800 dark:text-white">Prix Total</span><span className="text-xl font-bold text-primary dark:text-white">${totalPrice.toFixed(2)}</span></div>
          <div className="card-actions mt-6"><button className="btn btn-primary w-full" onClick={handleBooking}>Réserver maintenant</button></div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSidebar;
