const axios = require("axios");
const Stripe = require("stripe");
const { Paiement } = require("../models"); 
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crée un PaymentIntent Stripe pour initier un paiement.
 * @body {number} amount - Montant à payer (en cents).
 * @body {string} currency - Devise (par défaut "cad").
 * @body {Object} metadata - Métadonnées optionnelles à associer au paiement.
 * @returns {Object} Informations nécessaires au front-end pour finaliser le paiement Stripe.
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
 * Enregistre un paiement confirmé dans la base de données.
 * Gère dynamiquement la présence ou l'absence des clés optionnelles (idcontrat, idfacture, etc.).
 * @body {string} idintentstripe - Identifiant Stripe du paiement.
 * @body {number} idclient - Identifiant du client.
 * @body {number} idreservation - Identifiant de la réservation (optionnel).
 * @body {number} idcontrat - Identifiant du contrat (optionnel).
 * @body {string} modepaiement - Mode de paiement utilisé (ex : "card").
 * @returns {Object} Paiement enregistré.
 */
exports.enregistrerPaiement = async (req, res) => {
  try {
    // Récupère toutes les données nécessaires du corps de la requête
    const {
      idintentstripe,
      idclient,
      idreservation,
      idcontrat,
      modepaiement,
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
      idreservation: idreservation,
      modepaiement: modepaiement || 'card', 
    };
    
    if (idcontrat) {
        dataToCreate.idcontrat = idcontrat;
    }
    
    const paiement = await Paiement.create(dataToCreate);

    res.status(201).json({
        message: "Paiement enregistré avec succès.",
        paiement,
    });

  } catch (err) {
    // Journalisation détaillée de l'erreur pour faciliter le débogage
    console.error("Erreur DÉTAILLÉE dans enregistrerPaiement:", err); 
    res.status(400).json({
      message: "Erreur lors de l'enregistrement du paiement.",
      error: err.message,
    });
  }
};

/**
 * Effectue un remboursement via Stripe et l'enregistre en base.
 * @body {string} idintentstripe - Identifiant Stripe du paiement à rembourser.
 * @body {number} montant - Montant à rembourser (optionnel, en dollars).
 * @returns {Object} Détail du remboursement enregistré.
 */
exports.rembourserPaiement = async (req, res) => {
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

/**
 * Enregistre un paiement manuel pour un contrat et active le contrat correspondant.
 * @body {number} montant - Montant du paiement.
 * @body {string} mode - Mode de paiement utilisé.
 * @body {string} date - Date du paiement (optionnelle).
 * @body {string} note - Note ou commentaire (optionnel).
 * @body {number} idcontrat - Identifiant du contrat concerné.
 * @returns {Object} Paiement enregistré et confirmation d'activation du contrat.
 */
exports.enregistrerPaiementContrat = async (req, res) => {
  try {
    const { montant, mode, date, note, idcontrat } = req.body;

    const paiement = await Paiement.create({
      montant,
      modepaiement: mode,
      datepaiement: date ? new Date(date) : new Date(),
      note,
      idcontrat,
      idreservation: null,
      typepaiement: "paiement",
      statutpaiement: "succeeded",
      devise: "CAD",
      idintentstripe: `manuel-${Date.now()}`, // Génère un identifiant unique pour les paiements manuels
      idfacture: null,
    });

    // Met à jour le statut du contrat à "actif" via le service Contrat
    try {
      await axios.patch(
        `${process.env.GATEWAY_URL}/contrats/${idcontrat}/statut`, // Utilise GATEWAY_URL pour la cohérence environnementale
        { statut: "actif" },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut du contrat :", err.message);
    }

    res.status(201).json({
      message: "Paiement enregistré et contrat activé.",
      paiement,
    });
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de l'enregistrement du paiement du contrat.",
      error: err.message,
    });
  }
};
