// src/pages/PaymentPage.jsx (Version Finale et Robuste)

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import CheckoutForm from '../components/CheckoutForm';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Car, Calendar, MapPin, Hash } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // On initialise les états à des valeurs non-nulles pour éviter les erreurs
  const [clientSecret, setClientSecret] = useState('');
  const [recap, setRecap] = useState(null); // Recap peut rester null au début
  const [isLoading, setIsLoading] = useState(true);

  // Ce useEffect s'exécute une seule fois au montage
  useEffect(() => {
    // 1. On essaie de récupérer les données de la navigation (location.state)
    let stateData = location.state;

    // 2. Si les données n'existent pas (ex: rechargement de page), on essaie sessionStorage
    if (!stateData) {
      const savedDataString = sessionStorage.getItem('reservationDetails');
      if (savedDataString) {
        try {
          const savedData = JSON.parse(savedDataString);
          stateData = {
            clientSecret: savedData.clientSecret,
            idintentstripe: savedData.idintentstripe,
            recap: savedData.recap
          };
          
          // ✅ CORRECTION : Si le véhicule n'a pas les données de succursale, on les ajoute depuis les données sauvegardées
          if (stateData.recap?.vehicule && !stateData.recap.vehicule.Succursale && savedData.reservationData) {
            // On ajoute les informations de succursale depuis les données de réservation
            stateData.recap.vehicule.Succursale = {
              nomsuccursale: 'Succursale de départ',
              idsuccursale: savedData.reservationData.idsuccursalelivraison
            };
          }
        } catch (error) {
          console.error('Erreur lors du parsing des données sauvegardées:', error);
        }
      }
    }

    // 3. Si on n'a toujours rien, la session est perdue, on redirige
    if (!stateData || !stateData.clientSecret) {
      toast.error("Session de paiement invalide. Veuillez recommencer.");
      navigate('/');
      return;
    }

    // 4. On peuple nos états locaux avec les données trouvées
    setClientSecret(stateData.clientSecret);
    setRecap(stateData.recap); // Le recap contient toutes les infos nécessaires

    setIsLoading(false); // On a fini de charger les données
  }, [location.state, navigate]);


  // Préparation des options pour Stripe
  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: { theme: 'stripe' },
    };
  }, [clientSecret]);
  

  // Garde de chargement : on attend que `recap` et `stripeOptions` soient prêts
  if (isLoading || !recap || !stripeOptions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ✅ CORRECTION : Vérification complète des données nécessaires
  if (!recap.vehicule) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Données de véhicule manquantes</h2>
          <p className="text-slate-600 mb-4">Impossible de charger les informations du véhicule.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Si on arrive ici, `recap` existe et n'est pas null.
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Finalisez votre réservation</h1>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Colonne du récapitulatif */}
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg order-last md:order-first">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif de votre location</h2>
            
            {/* ✅ CORRECTION : On utilise `recap.vehicule` qui vient directement du backend */}
            <div className="flex items-center gap-4 mb-4">
                <img 
                  src={recap.vehicule?.VehiculeImages?.find(img => img.estprincipale)?.urlimage || recap.vehicule?.VehiculeImages?.[0]?.urlimage || 'https://via.placeholder.com/150'} 
                  alt={`${recap.vehicule?.marque || 'Véhicule'} ${recap.vehicule?.modele || ''}`}
                  className="rounded-lg object-cover w-28 h-20 bg-slate-300" 
                />
                <div>
                    <p className="font-bold text-lg">{recap.vehicule?.marque || 'Marque'} {recap.vehicule?.modele || 'Modèle'}</p>
                    <p className="text-sm text-slate-500">{recap.vehicule?.categorie || 'Catégorie non spécifiée'}</p>
                </div>
            </div>
            <div className="text-sm space-y-2 mb-4">
                {/* ✅ CORRECTION : Ajout de vérifications de sécurité pour éviter les erreurs */}
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 shrink-0"/> 
                  <span>
                    <strong>Départ :</strong> {recap.vehicule?.Succursale?.nomsuccursale || 'Succursale non spécifiée'}<br/>
                    {recap.datedebut ? format(new Date(recap.datedebut), 'd MMMM yyyy', { locale: fr }) : 'Date non spécifiée'}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Calendar size={16} className="mt-1 shrink-0"/> 
                  <span><strong>Durée :</strong> {recap.nbJours || 0} jours</span>
                </p>
            </div>
          
            <div className="divider my-4"></div>
            
            <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span>Location ({recap.nbJours || 0} jours)</span> <span>${recap.montantTotalLocation || '0.00'}</span></p>
                <p className="flex justify-between"><span>Taxes et frais</span> <span>${recap.taxes || '0.00'}</span></p>
                <p className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Coût total estimé</span> <span>${recap.montantTTC || '0.00'}</span></p>
            </div>
            
            <div className="divider my-4"></div>
            
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Dépôt à payer aujourd'hui</span> 
                <span>${recap.montantDepot || '0.00'}</span>
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
