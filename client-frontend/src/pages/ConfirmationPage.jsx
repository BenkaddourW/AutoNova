// src/pages/ConfirmationPage.jsx (Version finale qui lit l'ID depuis l'URL)

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

const ConfirmationPage = () => {
  const [status, setStatus] = useState('processing');
  const [reservation, setReservation] = useState(null);
  const [searchParams] = useSearchParams(); // Hook pour lire les paramètres de l'URL

  useEffect(() => {
    // ✅ CORRECTION : On récupère l'ID du paiement directement depuis l'URL.
    // Stripe le rajoute automatiquement après la redirection. ex: /confirmation?payment_intent=pi_...
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
        setStatus('error');
        toast.error("Référence de paiement manquante dans l'URL.");
        return;
    }

    const finalize = async () => {
      // On récupère les détails de la réservation qu'on avait sauvegardés
      const savedDetailsString = sessionStorage.getItem('reservationDetails');
      if (!savedDetailsString) {
        setStatus('error');
        toast.error("Session de réservation expirée ou invalide.");
        return;
      }
      const savedDetails = JSON.parse(savedDetailsString);
      
      try {
        // On appelle la route de finalisation avec l'ID du paiement qu'on vient de récupérer
        const response = await axios.post(`${GATEWAY_URL}/reservations/finalize`, {
          idintentstripe: paymentIntentId, // On utilise l'ID de l'URL
          reservationDetails: savedDetails,
        });

        setReservation(response.data.reservation);
        setStatus('success');
        sessionStorage.removeItem('reservationDetails'); // On nettoie la session
      } catch (err) {
        console.error("Erreur de finalisation:", err);
        toast.error(err.response?.data?.message || "La finalisation de la réservation a échoué.");
        setStatus('error');
      }
    };

    finalize();
  }, [searchParams]); // On dépend de searchParams pour lancer la finalisation

  // ... (Le JSX de la page de confirmation reste le même, il est déjà correct)
  if (status === 'processing') return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span><p>Finalisation de votre réservation...</p></div>;

  if (status === 'error') return (
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-red-500">Erreur de Réservation</h1>
      <p className="mt-2">Nous n'avons pas pu confirmer votre réservation. Veuillez contacter le support.</p>
      <Link to="/" className="btn btn-primary mt-4">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-green-500">Réservation Confirmée !</h1>
      <p className="mt-2">Merci. Un e-mail de confirmation vous a été envoyé.</p>
      <div className="mt-6 p-4 border rounded-lg max-w-md mx-auto text-left bg-slate-100 dark:bg-slate-800">
        <h2 className="font-semibold text-lg mb-2">Référence : {reservation?.numeroreservation}</h2>
        <p><strong>Véhicule :</strong> {reservation?.marque} {reservation?.modele}</p>
        <p><strong>Montant payé :</strong> ${Number(reservation?.montantttc).toFixed(2)}</p>
      </div>
      <Link to="/mes-reservations" className="btn btn-primary mt-6">Voir mes réservations</Link>
    </div>
  );
};

export default ConfirmationPage;