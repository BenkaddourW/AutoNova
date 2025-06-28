// Fichier : src/components/ReservationSidebar.jsx (VERSION FINALE CORRIGÉE)

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar } from 'lucide-react';
import * as reservationService from '../services/reservationService';

// Helper function pour formater l'adresse
const formatAddress = (succursale) => {
  if (!succursale) return 'Adresse non disponible';
  return [succursale.adresse1, succursale.ville, succursale.codepostal].filter(Boolean).join(', ');
};

const ReservationSidebar = ({ vehicle, succursales = [], initialDates }) => {
  const { user, isAuthenticated, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [dates, setDates] = useState({
    from: initialDates?.from ? new Date(initialDates.from) : undefined,
    to: initialDates?.to ? new Date(initialDates.to) : undefined,
  });
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [returnLocationId, setReturnLocationId] = useState(vehicle?.succursaleidsuccursale || '');

  const departureSuccursaleId = vehicle?.succursaleidsuccursale;
  const departureSuccursale = succursales.find(s => s.idsuccursale === departureSuccursaleId);
  const returnSuccursale = succursales.find(s => s.idsuccursale.toString() === returnLocationId.toString());

  useEffect(() => {
    if (vehicle?.succursaleidsuccursale) {
      setReturnLocationId(vehicle.succursaleidsuccursale.toString());
    }
  }, [vehicle]);

  useEffect(() => {
    if (dates.from && dates.to && dates.from < dates.to) {
      setNumberOfDays(differenceInCalendarDays(dates.to, dates.from) || 1);
    } else {
      setNumberOfDays(0);
    }
  }, [dates]);
  
  const tarifAsNumber = Number(vehicle?.tarifjournalier || 0);
  const totalPrice = numberOfDays * tarifAsNumber;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      navigate('/login', { state: { from: location } }); 
      return;
    }
    if (!isProfileComplete || !user?.idclient) {
      toast.error("Veuillez compléter votre profil avant de réserver.", { duration: 4000 });
      navigate('/compte', { state: { fromCompletion: true } });
      return;
    }
    if (numberOfDays <= 0) {
      toast.error("Veuillez sélectionner une période de location valide.");
      return;
    }

    setIsProcessing(true);
    toast.loading('Préparation de votre paiement...');

    try {
      // ✅ LA CORRECTION EST ICI ✅
      // On s'assure que les ID des succursales sont bien inclus.
      const reservationRequestPayload = {
        idvehicule: vehicle.idvehicule,
        idclient: user.idclient,
        idsuccursalelivraison: vehicle.succursaleidsuccursale, // ID de la succursale de départ
        idsuccursaleretour: returnLocationId, // ID de la succursale de retour sélectionnée
        datedebut: dates.from.toISOString(),
        datefin: dates.to.toISOString(),
      };
      
      // Ajout d'un log pour vérifier les données envoyées
      console.log("Envoi des données de réservation au backend:", reservationRequestPayload);

      const response = await reservationService.initiateCheckout(reservationRequestPayload);
      
      toast.dismiss();
      
      // ✅ CORRECTION : On sauvegarde les données complètes de la réservation
      const reservationDetails = {
        clientSecret: response.clientSecret,
        idintentstripe: response.idintentstripe,
        recap: response.recap,
        reservationData: reservationRequestPayload // On garde aussi les données originales
      };
      
      sessionStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
      
      navigate('/paiement', {
        state: {
          clientSecret: response.clientSecret,
          idintentstripe: response.idintentstripe,
          recap: response.recap 
        }
      });

    } catch (err) {
      toast.dismiss();
      console.error("Erreur lors de l'initialisation du paiement:", err);
      toast.error(err.response?.data?.message || "Une erreur est survenue lors de l'initialisation.");
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
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{departureSuccursale?.nomsuccursale || 'Chargement...'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatAddress(departureSuccursale)}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Adresse de retour</label>
              <select className="select select-bordered w-full" value={returnLocationId} onChange={(e) => setReturnLocationId(e.target.value)}>
                {Array.isArray(succursales) && succursales.map(s => (<option className="dark:text-black" key={s.idsuccursale} value={s.idsuccursale}>{s.nomsuccursale}</option>))}
              </select>
              {returnSuccursale && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-1">{formatAddress(returnSuccursale)}</p>)}
            </div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="space-y-2">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prise en charge</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{dates.from ? format(dates.from, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Retour</label><div className="input input-bordered w-full flex items-center bg-slate-100 dark:bg-slate-700 h-10"><Calendar size={16} className="mr-2 text-slate-500" /><span className="text-sm">{dates.to ? format(dates.to, 'd MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}</span></div></div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-300">Prix par jour</span><span className="font-semibold text-slate-700 dark:text-slate-200">${tarifAsNumber.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-300">Nombre de jours</span><span className="font-semibold text-slate-700 dark:text-slate-200">{numberOfDays}</span></div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="flex justify-between items-center"><span className="text-lg font-bold text-slate-800 dark:text-white">Sous-total (avant taxes)</span><span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span></div>
          
          <div className="card-actions mt-6">
            {dates.from && dates.to ? (
              <button 
                className="btn btn-primary w-full" 
                onClick={handleBooking} 
                disabled={isProcessing || numberOfDays <= 0}
              >
                {isProcessing ? <span className="loading loading-spinner"></span> : 'Continuer vers le paiement'}
              </button>
            ) : (
              <button
                className="btn btn-outline w-full"
                onClick={() => navigate('/vehicules')}
              >
                Faire une recherche
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSidebar;
