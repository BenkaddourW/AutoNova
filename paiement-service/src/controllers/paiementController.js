// paiement-service/src/controllers/paiementController.js (Version finale corrigée)

const Stripe = require("stripe");
const { Paiement } = require("../models"); 
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crée un PaymentIntent Stripe.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "cad", metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Un montant valide est requis." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata,
      payment_method_types: ["card"],
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret, 
      idintentstripe: paymentIntent.id
    });
  } catch (err) {
    console.error("Erreur Stripe dans createPaymentIntent:", err.message);
    res.status(400).json({ message: "Erreur lors de la création de l'intention de paiement." });
  }
};


/**
 * Enregistre un paiement dans la base de données après confirmation Stripe.
 */
/**
 * Enregistre un paiement dans la base de données après confirmation Stripe.
 */
/**
 * Enregistre un paiement dans la base de données.
 * Gère dynamiquement la présence ou l'absence des clés optionnelles
 * comme idcontrat et idfacture.
 */
exports.enregistrerPaiement = async (req, res) => {
  try {
    // On récupère TOUTES les données du body, y compris idreservation et modepaiement
    const {
      idintentstripe,
      idclient,
      idreservation, // <-- Très important de le récupérer
      idcontrat,
      modepaiement, // <-- Important de le récupérer
    } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Le paiement n'est pas confirmé." });
    }
    
    const dataToCreate = {
      montant: paymentIntent.amount_received / 100,
      devise: paymentIntent.currency,
      typepaiement: 'paiement',
      idintentstripe: paymentIntent.id,
      statutpaiement: paymentIntent.status,
      datepaiement: new Date(),
      idclient: idclient,
      idreservation: idreservation, // <-- Très important de l'inclure ici

      // ✅ LA CORRECTION DÉFINITIVE : On utilise la valeur reçue, OU 'card' par défaut.
      modepaiement: modepaiement || 'card', 
    };
    
    // On gère le cas où idcontrat est optionnel
    if (idcontrat) {
        dataToCreate.idcontrat = idcontrat;
    }
    
    const paiement = await Paiement.create(dataToCreate);

    res.status(201).json({
        message: "Paiement enregistré avec succès.",
        paiement,
    });

  } catch (err) {
    // Log amélioré pour voir l'erreur complète dans la console du Paiement-Service
    console.error("Erreur DÉTAILLÉE dans enregistrerPaiement:", err); 
    res.status(400).json({
      message: "Erreur lors de l'enregistrement du paiement.",
      error: err.message, // On envoie le message d'erreur clair
    });
  }
};
/**
 * Effectue un remboursement Stripe.
 */
exports.rembourserPaiement = async (req, res) => {
  // Votre logique de remboursement peut rester telle quelle, elle est déjà correcte.
  try {
    const { idintentstripe, montant } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Le paiement d'origine n'est pas confirmé ou inexistant." });
    }

    const refund = await stripe.refunds.create({
      payment_intent: idintentstripe,
      amount: montant ? Math.round(Number(montant) * 100) : undefined,
    });

    if (refund.status !== "succeeded") {
      return res.status(400).json({ message: "Le remboursement a échoué sur Stripe." });
    }

    const remboursement = await Paiement.create({
      montant: refund.amount / 100,
      devise: refund.currency,
      typepaiement: "remboursement",
      idintentstripe,
      statutpaiement: refund.status,
      idreservation: paymentIntent.metadata.idreservation || null,
      idclient: paymentIntent.metadata.idclient || null,
      idcontrat: null,
      
      datepaiement: new Date(),
    });

    res.status(201).json({
      message: "Remboursement effectué et enregistré avec succès.",
      remboursement,
    });
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors du remboursement.",
      error: err.message,
    });
  }
};
