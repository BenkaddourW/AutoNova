const Stripe = require("stripe");
const axios = require("axios");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Paiement } = require("../models/paiement"); // Assure-toi d'importer correctement ton modèle

/**
 * Crée un PaymentIntent Stripe et retourne le clientSecret au frontend
 * pour permettre au client d’initier un paiement sécurisé.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "cad" } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ message: "Erreur Stripe", error: err.message });
  }
};

/**
 * Enregistre un paiement dans la base de données après confirmation Stripe.
 * Vérifie le statut du PaymentIntent auprès de Stripe avant d’enregistrer.
 */
exports.enregistrerPaiement = async (req, res) => {
  try {
    const {
      montant,
      devise,
      typepaiement, // Par défaut, on enregistre comme paiement
      idintentstripe,
      statutpaiement,
      idreservation,
      idcontrat,
      idfacture,
      modepaiement,
    } = req.body;

    // Vérifier le statut du PaymentIntent auprès de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
    if (paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .json({ message: "Le paiement n'est pas confirmé par Stripe." });
    }

    // Enregistre le paiement dans la base
    const paiement = await Paiement.create({
      montant,
      devise,
      typepaiement,
      idintentstripe,
      statutpaiement,
      idreservation,
      idcontrat,
      idfacture,
      modepaiement,
      datepaiement: new Date(),
    });

    // Appel au service contrat pour mettre à jour le statut
    try {
      await axios.patch(
        `http://contrat-service:3010/contrats/${idcontrat}/statut`,
        { statut: "payé" }, // ou "valide" selon ta logique métier
        {
          headers: {
            Authorization: req.headers.authorization, // transmet le token si besoin
          },
        }
      );
    } catch (err) {
      // Optionnel : gérer l'échec de la mise à jour du contrat
      console.error("Erreur lors de la mise à jour du contrat :", err.message);
    }

    res
      .status(201)
      .json({
        message: "Paiement enregistré et contrat mis à jour.",
        paiement,
      });
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de l'enregistrement du paiement.",
      error: err.message,
    });
  }
};

/**
 * Effectue un remboursement Stripe et l’enregistre dans la base de données.
 * Vérifie le statut du remboursement auprès de Stripe avant d’enregistrer.
 */
exports.rembourserPaiement = async (req, res) => {
  try {
    const {
      idintentstripe,
      montant, // en DECIMAL(8,2), optionnel pour remboursement partiel
      devise,
      idreservation,
      idcontrat,
      idfacture,
      modepaiement,
    } = req.body;

    // Vérifie que le PaymentIntent existe et est payé
    const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Le paiement d'origine n'est pas confirmé ou inexistant.",
      });
    }

    // Effectue le remboursement Stripe (en centimes)
    const refund = await stripe.refunds.create({
      payment_intent: idintentstripe,
      amount: montant ? Math.round(Number(montant) * 100) : undefined, // Stripe attend des centimes
    });

    if (refund.status !== "succeeded") {
      return res
        .status(400)
        .json({ message: "Le remboursement a échoué sur Stripe." });
    }

    // Enregistre le remboursement dans la base
    const remboursement = await Paiement.create({
      montant: montant || paymentIntent.amount / 100, // montant remboursé
      devise: devise || paymentIntent.currency,
      typepaiement: "remboursement",
      idintentstripe,
      statutpaiement: refund.status,
      idreservation,
      idcontrat,
      idfacture,
      modepaiement,
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
