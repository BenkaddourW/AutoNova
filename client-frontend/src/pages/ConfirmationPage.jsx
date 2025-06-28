// src/pages/ConfirmationPage.jsx

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios'; // On utilise axios pour la simplicité
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

const ConfirmationPage = () => {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [reservation, setReservation] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finalize = async () => {
      // 1. Récupérer l'ID de l'intention de paiement depuis l'URL (ajouté par Stripe)
      const paymentIntentId = searchParams.get('payment_intent');
      if (!paymentIntentId) {
        setStatus('error');
        toast.error("Référence de paiement manquante.");
        return;
      }

      // 2. Récupérer les détails de la réservation sauvegardés dans le sessionStorage
      const savedDetailsString = sessionStorage.getItem('reservationDetails');
      if (!savedDetailsString) {
        setStatus('error');
        toast.error("Session de réservation expirée.");
        return;
      }
      const reservationDetails = JSON.parse(savedDetailsString);
      
      try {
        const token = localStorage.getItem('accessToken');
        // 3. Appeler notre backend pour finaliser et créer la réservation
        const response = await axios.post(
          `${GATEWAY_URL}/reservations/finalize`, 
          {
            idintentstripe: paymentIntentId,
            reservationDetails: reservationDetails,
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        setReservation(response.data.reservation);
        setStatus('success');
        toast.success("Votre réservation est confirmée !");
        sessionStorage.removeItem('reservationDetails'); // Nettoyage
      } catch (err) {
        console.error("Erreur de finalisation:", err);
        toast.error(err.response?.data?.message || "La finalisation de la réservation a échoué.");
        setStatus('error');
      }
    };

    finalize();
  }, [searchParams]); // Se déclenche une seule fois

  if (status === 'processing') {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-slate-900">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <p className="text-slate-500 dark:text-slate-300">Finalisation de votre réservation en cours...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 dark:text-red-400">Erreur de Réservation</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Nous n'avons pas pu confirmer votre réservation. Veuillez contacter le support.</p>
        <Link to="/" className="btn btn-primary mt-6">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-slate-900">
        <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Réservation Confirmée !</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Merci, votre réservation a été enregistrée. Un e-mail de confirmation vous a été envoyé.</p>
        <div className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg max-w-md mx-auto text-left bg-slate-100 dark:bg-slate-800">
            <h2 className="font-semibold text-lg mb-2 text-slate-800 dark:text-white">Référence : {reservation?.numeroreservation}</h2>
            <p className="text-slate-700 dark:text-slate-200"><strong>Véhicule :</strong> {reservation?.marque} {reservation?.modele}</p>
            <p className="text-slate-700 dark:text-slate-200"><strong>Montant payé :</strong> ${Number(reservation?.montantttc).toFixed(2)}</p>
        </div>
        <Link to="/compte/reservations" className="btn btn-primary mt-8">Voir mes réservations</Link>
    </div>
  );
};

export default ConfirmationPage;