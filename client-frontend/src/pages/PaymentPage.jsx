// src/pages/PaymentPage.jsx (Version Finale avec affichage des taxes et calcul du solde)

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import CheckoutForm from '../components/CheckoutForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Car, Calendar, MapPin } from 'lucide-react';

// Chargement de la clé publique Stripe depuis les variables d'environnement
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState('');
  const [recap, setRecap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stateData = location.state;

    if (!stateData) {
      const savedRecapString = sessionStorage.getItem('paymentRecap');
      if (savedRecapString) {
        // Logique de récupération depuis sessionStorage si nécessaire
        try {
            stateData = JSON.parse(savedRecapString);
        } catch(e) { console.error(e); }
      }
    }

    if (!stateData || !stateData.clientSecret || !stateData.recap) {
      toast.error("Session de paiement invalide ou expirée. Veuillez recommencer.");
      navigate('/');
      return;
    }

    setClientSecret(stateData.clientSecret);
    setRecap(stateData.recap);
    
    // On sauvegarde aussi l'objet complet qui inclut le clientSecret pour la robustesse
    // Note: Dans une application en production, on ne stockerait pas le clientSecret.
    sessionStorage.setItem('paymentDetails', JSON.stringify(stateData));
    
    setIsLoading(false);
  }, [location.state, navigate]);

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: { theme: 'stripe' },
    };
  }, [clientSecret]);

  if (isLoading || !recap || !stripeOptions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Finalisez votre réservation</h1>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Colonne du récapitulatif */}
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg order-last md:order-first">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Récapitulatif de votre location</h2>
            <div className="flex items-center gap-4 mb-4">
                <img 
                  src={recap.vehicule?.VehiculeImages?.find(img => img.estprincipale)?.urlimage || recap.vehicule?.VehiculeImages?.[0]?.urlimage || 'https://via.placeholder.com/150'} 
                  alt={`${recap.vehicule?.marque || ''} ${recap.vehicule?.modele || ''}`}
                  className="rounded-lg object-cover w-28 h-20 bg-slate-300 dark:bg-slate-700" 
                />
                <div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{recap.vehicule?.marque} {recap.vehicule?.modele}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{recap.vehicule?.categorie}</p>
                </div>
            </div>
            <div className="text-sm space-y-2 mb-4 text-slate-700 dark:text-slate-200">
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 shrink-0 text-slate-500 dark:text-slate-300"/> 
                  <span>
                    <strong className="text-slate-800 dark:text-white">Départ :</strong> {recap.succursaleDepart.nomsuccursale}<br/>
                    {format(new Date(recap.datedebut), 'd MMMM yyyy, HH:mm', { locale: fr })}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Calendar size={16} className="mt-1 shrink-0 text-slate-500 dark:text-slate-300"/> 
                  <span><strong className="text-slate-800 dark:text-white">Durée :</strong> {recap.nbJours} jours</span>
                </p>
            </div>
            <div className="divider my-4 dark:bg-slate-700"></div>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <p className="flex justify-between">
                    <span>Location ({recap.nbJours} jours)</span> 
                    <span>${recap.montantTotalLocation}</span>
                </p>
                {recap.taxes_detail && recap.taxes_detail.length > 0 && (
                  <div className="pl-4 text-slate-500 dark:text-slate-400">
                    {recap.taxes_detail.map(taxe => (
                      <p key={taxe.idtaxe} className="flex justify-between">
                        <span>{taxe.denomination} ({taxe.taux}%)</span>
                        <span>+ ${taxe.montant}</span>
                      </p>
                    ))}
                  </div>
                )}
                <p className="flex justify-between font-semibold border-t dark:border-slate-600 pt-2 mt-2">
                    <span>Coût total estimé</span> 
                    <span>${recap.montantTTC}</span>
                </p>
            </div>
            <div className="divider my-4 dark:bg-slate-700"></div>
            <div className="flex justify-between items-center font-bold text-lg text-slate-900 dark:text-white">
                <span>Dépôt à payer aujourd'hui</span> 
                <span>50$</span>
            </div>
        </div>

        {/* Colonne du paiement Stripe */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Paiement sécurisé du dépôt</h2>
          <Elements options={stripeOptions} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
