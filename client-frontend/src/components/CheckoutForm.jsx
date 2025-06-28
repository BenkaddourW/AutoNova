// src/components/CheckoutForm.jsx (Version Finale et Complète)

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

const CheckoutForm = () => {
  // 1. On récupère les outils de Stripe
  const stripe = useStripe();
  const elements = useElements();

  // 2. On prépare des états pour gérer les messages et le chargement
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 3. Cette fonction est appelée quand on clique sur le bouton "Payer"
  const handleSubmit = async (e) => {
    e.preventDefault();

    // On s'assure que Stripe est bien chargé
    if (!stripe || !elements) {
      toast.error("Stripe n'est pas prêt. Veuillez patienter.");
      return;
    }

    setIsProcessing(true); // On affiche "Traitement..." sur le bouton
    setMessage(null); // On efface les messages d'erreur précédents

    console.log("Début du processus de paiement...");

    // 4. On demande à Stripe de confirmer le paiement.
    // C'est ici que les infos de la carte sont envoyées à Stripe de manière sécurisée.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // L'URL où Stripe doit rediriger l'utilisateur après le paiement (succès ou échec)
        return_url: `${window.location.origin}/reservation/confirmation`,
      },
    });

    // Cette partie du code ne s'exécute que si une erreur immédiate se produit
    // (ex: erreur de validation de la carte). Sinon, l'utilisateur est redirigé.
    if (error) {
      console.error("Erreur de paiement Stripe:", error);
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
        toast.error(error.message);
      } else {
        setMessage("Une erreur inattendue est survenue.");
        toast.error("Une erreur inattendue est survenue.");
      }
      setIsProcessing(false); // On réactive le bouton en cas d'erreur
    } else {
      console.log("Paiement en cours de traitement, redirection...");
      // Le paiement est en cours, l'utilisateur sera redirigé automatiquement
    }
  };

  return (
    // On lie notre fonction handleSubmit au formulaire
    <form id="payment-form" onSubmit={handleSubmit}>
      
      {/* ✅ C'EST LE COMPOSANT MANQUANT ✅ */}
      {/* C'est cette ligne qui dessine les champs "Numéro de carte", "Date", "CVC" */}
      <PaymentElement id="payment-element" />

      {/* Le bouton pour soumettre le formulaire */}
      <button disabled={isProcessing || !stripe || !elements} id="submit" className="btn btn-primary w-full mt-6">
        <span>
          {isProcessing ? "Traitement en cours..." : "Payer maintenant"}
        </span>
      </button>

      {/* Affiche les messages d'erreur de paiement si besoin */}
      {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
