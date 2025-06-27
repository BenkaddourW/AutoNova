// src/components/ReservationSidebar.jsx (Version finale correcte qui gère le paiement)

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar } from 'lucide-react';
import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

const formatAddress = (succursale) => {
  if (!succursale) return 'Adresse non disponible';
  return `${succursale.adresse1}, ${succursale.ville}, ${succursale.codepostal}`;
};

const ReservationSidebar = ({ vehicle, succursales = [], initialDates }) => {
  const { user, isAuthenticated, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Pour le DayPicker, vous devriez probablement utiliser un état local
  // pour permettre à l'utilisateur de changer les dates.
  const [dates, setDates] = useState({
    from: initialDates?.from ? new Date(initialDates.from) : undefined,
    to: initialDates?.to ? new Date(initialDates.to) : undefined,
  });
  
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [returnLocationId, setReturnLocationId] = useState('');
  const [selectedReturnSuccursale, setSelectedReturnSuccursale] = useState(null);

  useEffect(() => {
    if (vehicle?.Succursale) {
      const initialId = vehicle.succursaleidsuccursale.toString();
      setReturnLocationId(initialId);
      setSelectedReturnSuccursale(succursales.find(s => s.idsuccursale.toString() === initialId));
    }
  }, [vehicle, succursales]);

  useEffect(() => {
    if (dates.from && dates.to && dates.from < dates.to) {
      setNumberOfDays(differenceInCalendarDays(dates.to, dates.from) || 1);
    } else {
      setNumberOfDays(0);
    }
  }, [dates]);

  const tarifAsNumber = Number(vehicle.tarifjournalier || 0);
  const totalPrice = numberOfDays * tarifAsNumber;

  const handleBooking = async () => {
    // 1. Vérifications de sécurité et de logique métier
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      navigate('/login', { state: { from: location } }); 
      return;
    }
    if (!isProfileComplete) {
      toast.error("Veuillez compléter votre profil avant de réserver.", { duration: 4000 });
      navigate('/compte');
      return;
    }
    if (numberOfDays <= 0) {
      toast.error("Veuillez sélectionner une période de location valide.");
      return;
    }

    setIsProcessing(true);
    toast.loading('Préparation de votre paiement...');

    try {
      // 2. On prépare la requête pour le backend
      const reservationRequestPayload = {
        idvehicule: vehicle.idvehicule,
        idclient: user.idclient,
        idsuccursalelivraison: vehicle.succursaleidsuccursale,
        idsuccursaleretour: returnLocationId,
        datedebut: dates.from.toISOString(),
        datefin: dates.to.toISOString(),
      };
      
      // 3. On appelle le backend pour créer l'intention de paiement
      const response = await axios.post(`${GATEWAY_URL}/reservations/initiate-checkout`, reservationRequestPayload);
      
      toast.dismiss();

      // 4. On construit l'état à passer à la page de paiement
      const navigationState = {
        clientSecret: response.data.clientSecret,
        recap: response.data.recap,
        idintentstripe: response.data.idintentstripe,
        reservationDetails: {
          ...reservationRequestPayload,
          affichage: {
            vehiculeNom: `${vehicle.marque} ${vehicle.modele}`,
            vehiculeImage: vehicle.VehiculeImages?.[0]?.urlimage || '',
            succursaleDepartNom: vehicle.Succursale?.nomsuccursale,
            succursaleRetourNom: selectedReturnSuccursale?.nomsuccursale,
          }
        }
      };

      if (!navigationState.clientSecret) {
        throw new Error("Le 'clientSecret' est manquant dans la réponse de l'API !");
      }

      // 5. On navigue vers la page de paiement avec toutes les données
      navigate('/paiement', {
        replace: true,
        state: navigationState
      });

    } catch (err) {
      toast.dismiss();
      console.error("Erreur lors de l'initialisation du paiement:", err);
      toast.error(err.response?.data?.message || "Une erreur est survenue.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="sticky top-24">
      <div className="card bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="card-body p-6">
          <h3 className="card-title text-xl text-slate-800 dark:text-white mb-4">Détails de la réservation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Adresse de départ</label>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{vehicle.Succursale?.nomsuccursale}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatAddress(vehicle.Succursale)}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Adresse de retour</label>
              <select className="select select-bordered w-full" value={returnLocationId} onChange={(e) => setReturnLocationId(e.target.value)}>
                {succursales.map(s => (<option className="dark:text-black" key={s.idsuccursale} value={s.idsuccursale}>{s.nomsuccursale}</option>))}
              </select>
              {selectedReturnSuccursale && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-1">{formatAddress(selectedReturnSuccursale)}</p>)}
            </div>
          </div>
          
          <div className="divider my-4"></div>
          
          {/* Ici, vous devriez mettre un vrai DayPicker pour que l'utilisateur puisse choisir */}
          <div className="space-y-2">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prise en charge</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{dates.from ? format(dates.from, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Retour</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{dates.to ? format(dates.to, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Prix par jour</span><span className="font-semibold text-slate-700 dark:text-slate-200">${tarifAsNumber.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nombre de jours</span><span className="font-semibold text-slate-700 dark:text-slate-200">{numberOfDays}</span></div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="flex justify-between items-center"><span className="text-lg font-bold text-slate-800 dark:text-white">Sous-total (avant taxes)</span><span className="text-xl font-bold text-primary dark:text-white">${totalPrice.toFixed(2)}</span></div>
          
          <div className="card-actions mt-6">
            <button 
              className="btn btn-primary w-full" 
              onClick={handleBooking} 
              disabled={isProcessing || numberOfDays <= 0}
            >
              {isProcessing ? <span className="loading loading-spinner"></span> : 'Continuer vers le paiement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSidebar;
