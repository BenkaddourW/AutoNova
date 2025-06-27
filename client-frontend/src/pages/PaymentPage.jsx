// src/pages/PaymentPage.jsx (Version finale et la plus robuste)

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import CheckoutForm from '../components/CheckoutForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. On utilise des états séparés et initialisés à null/vide.
  const [clientSecret, setClientSecret] = useState('');
  const [recap, setRecap] = useState(null);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [idintentstripe, setIdintentstripe] = useState('');
  const [isLoading, setIsLoading] = useState(true); // État de chargement explicite

  // 2. Ce useEffect s'exécute une seule fois pour initialiser les états.
  useEffect(() => {
    const stateFromLocation = location.state;

    // Si on arrive sur la page sans données, on redirige.
    if (!stateFromLocation || !stateFromLocation.clientSecret) {
      toast.error("Session de paiement invalide. Veuillez recommencer.");
      navigate('/');
      return;
    }

    // On peuple nos états locaux avec les données reçues
    setClientSecret(stateFromLocation.clientSecret);
    setRecap(stateFromLocation.recap);
    setReservationDetails(stateFromLocation.reservationDetails);
    setIdintentstripe(stateFromLocation.idintentstripe);

    // On sauvegarde les données dans sessionStorage pour la page de confirmation
    sessionStorage.setItem('reservationDetails', JSON.stringify(stateFromLocation));
    
    setIsLoading(false); // On a fini de charger les données
  }, []); // Le tableau de dépendances vide garantit une exécution unique.


  // 3. Préparation des options pour Stripe
  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: { theme: 'stripe' },
    };
  }, [clientSecret]);
  

  // 4. Garde de chargement beaucoup plus simple
  if (isLoading || !stripeOptions) {
    return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  // On peut extraire `affichage` ici en toute sécurité
  const { affichage } = reservationDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Finalisez votre réservation</h1>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Colonne du récapitulatif */}
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg order-last md:order-first">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif de votre location</h2>
            {affichage && (
              <>
                <div className="flex items-center gap-4 mb-4">
                    <img src={affichage.vehiculeImage} alt={affichage.vehiculeNom} className="rounded-lg object-cover w-28 h-20" />
                    <div>
                        <p className="font-bold text-lg">{affichage.vehiculeNom}</p>
                        <p className="text-sm text-slate-500">{recap.vehicule?.categorie}</p>
                    </div>
                </div>
                <div className="text-sm space-y-2 mb-4">
                    <p><strong>Départ :</strong> {affichage.succursaleDepartNom}<br/>{format(new Date(reservationDetails.datedebut), 'd MMMM yyyy', { locale: fr })}</p>
                    <p><strong>Retour :</strong> {affichage.succursaleRetourNom}<br/>{format(new Date(reservationDetails.datefin), 'd MMMM yyyy', { locale: fr })}</p>
                </div>
              </>
            )}
            <div className="divider my-4"></div>
            <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span>Location ({recap.nbJours} jours)</span> <span>${recap.montantTotal}</span></p>
                <p className="flex justify-between"><span>Taxes et frais</span> <span>${recap.taxes}</span></p>
                <p className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Coût total estimé</span> <span>${recap.montantTTC}</span></p>
            </div>
            <div className="divider my-4"></div>
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Dépôt à payer aujourd'hui</span> 
                <span>${recap.montantDepot}</span>
            </div>
            <p className="text-xs text-slate-500 mt-4">Le solde restant sera dû au moment de la prise en charge du véhicule.</p>
        </div>

        {/* Colonne du paiement Stripe */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Paiement du dépôt</h2>
          <Elements options={stripeOptions} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
