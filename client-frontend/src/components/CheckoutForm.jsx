// src/components/CheckoutForm.jsx (Version Corrigée et Intégrée)

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

// ✅ CORRECTION 1: Accepter les props du parent (PaymentPage)
// reservationDetails contient toutes les infos sur la réservation.
// onBeforeRedirect est la fonction qui sauvegarde ces infos dans sessionStorage.
const CheckoutForm = ({ reservationDetails, onBeforeRedirect }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sécurité : Si les props nécessaires ne sont pas là, on affiche une erreur claire.
  if (!reservationDetails || !onBeforeRedirect) {
    return <div className="text-red-500 p-4 bg-red-100 rounded-md">Erreur : Données de réservation manquantes pour le formulaire de paiement.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe n'est pas prêt. Veuillez patienter.");
      return;
    }

    // Empêche les doubles clics pendant le traitement
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // ✅ CORRECTION 2: Appeler la fonction de sauvegarde AVANT la redirection Stripe
    // C'est l'étape cruciale qui garantit que la ConfirmationPage trouvera les données.
    try {
        console.log("[CheckoutForm] Sauvegarde des détails de réservation avant la redirection...");
        onBeforeRedirect(reservationDetails);
    } catch (err) {
        console.error("Erreur lors de la sauvegarde en sessionStorage:", err);
        toast.error("Une erreur locale est survenue. Impossible de continuer.");
        setIsProcessing(false);
        return;
    }

    // On confirme le paiement avec Stripe.
    // Stripe gère la redirection vers la `return_url` si tout va bien.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservation/confirmation`,
      },
    });

    // Cette partie du code ne s'exécute que si une erreur immédiate et locale se produit
    // (ex: carte invalide), empêchant la redirection.
    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
            toast.error(error.message);
        } else {
            setMessage("Une erreur inattendue est survenue.");
            toast.error("Une erreur inattendue est survenue.");
        }
        // On réactive le bouton pour que l'utilisateur puisse corriger et réessayer
        setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      
      <PaymentElement id="payment-element" />

      {/* ✅ CORRECTION 3: Bouton de paiement dynamique et sécurisé */}
      <button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="btn btn-primary w-full mt-6"
      >
        <span>
          {isProcessing
            ? "Traitement en cours..."
            // On affiche le montant total à payer pour plus de clarté
            : `Payer`}
        </span>
      </button>

      {/* Affiche les messages d'erreur de Stripe si besoin */}
      {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
