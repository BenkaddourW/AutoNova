// src/pages/ConfirmationPage.jsx (Version Finale Anti-Double-Appel)

import { useState, useEffect, useRef } from 'react'; // <-- Importer useRef
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { finalizeReservation } from '../services/reservationService';

const ConfirmationPage = () => {
  const [status, setStatus] = useState('processing');
  const [reservation, setReservation] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ CORRECTION 1: Utiliser un "ref" pour s'assurer que la logique ne s'exécute qu'une seule fois
  const hasFinalized = useRef(false);

  useEffect(() => {
    const finalize = async () => {
      // Si la finalisation a déjà été lancée, on ne fait rien.
      if (hasFinalized.current) {
        return;
      }
      // On marque immédiatement la finalisation comme "en cours".
      hasFinalized.current = true;

      const paymentIntentId = searchParams.get('payment_intent');
      if (!paymentIntentId) {
        setStatus('error');
        toast.error("Référence de paiement manquante dans l'URL.");
        return;
      }

      const savedDetailsString = sessionStorage.getItem('reservationDetails');
      if (!savedDetailsString) {
        setStatus('error');
        toast.error("Session de réservation expirée. Impossible de finaliser.");
        navigate('/');
        return;
      }
      
      const reservationDetails = JSON.parse(savedDetailsString);
      
      try {
        const response = await finalizeReservation({
          idintentstripe: paymentIntentId,
          reservationDetails: reservationDetails,
        });

        setReservation(response.reservation);
        setStatus('success');
        sessionStorage.removeItem('reservationDetails');
        toast.success(response.message || "Réservation confirmée avec succès !");

      } catch (error) {
        console.error("Erreur lors de la finalisation:", error);
        // Si l'erreur est que la résa existe déjà (code 200), on traite ça comme un succès
        if (error.response && error.response.status === 200) {
            console.log("Réservation déjà traitée, affichage de la page de succès.");
            setStatus('success');
            setReservation(error.response.data.reservation); // Assurez-vous que le backend renvoie la résa
            sessionStorage.removeItem('reservationDetails');
        } else {
            setStatus('error');
            toast.error(error.message || "Erreur lors de la finalisation de la réservation.");
        }
      }
    };

    finalize();
  }, [searchParams, navigate]);

  // Le reste du composant ne change pas
  if (status === 'processing') {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <h1 className="text-2xl font-bold">Finalisation de votre réservation...</h1>
        <p className="mt-2">Veuillez patienter pendant que nous confirmons votre paiement.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-600">Erreur de confirmation</h1>
        <p className="mt-2">Une erreur est survenue. Veuillez vérifier vos réservations ou contacter le support.</p>
        <Link to="/" className="btn btn-primary mt-6">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-green-600">Réservation Confirmée !</h1>
        <p className="mt-2">Merci, votre réservation a été enregistrée.</p>
        <div className="mt-6 p-4 border rounded-lg max-w-md mx-auto text-left">
            <h2 className="font-semibold text-lg mb-2">Référence : {reservation?.numeroreservation}</h2>
            <p><strong>Véhicule :</strong> {reservation?.marque} {reservation?.modele}</p>
            <p><strong>Montant payé :</strong> ${Number(reservation?.montantttc).toFixed(2)}</p>
        </div>
        <Link to="/compte/reservations" className="btn btn-primary mt-8">Voir mes réservations</Link>
    </div>
  );
};

export default ConfirmationPage;
