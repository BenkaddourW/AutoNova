const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const Reservation = require("../models/reservation")(sequelize, DataTypes);
const Client = require("../models/client");
const Vehicule = require("../models/vehicule");
const Paiement = require("../models/paiement");
const Succursale = require("../models/succursale");
const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");
const axios = require("axios");
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";
async function verifyForeignKeys(body) {
  const {
    idclient,
    idvehicule,
    idpaiement,
    idsuccursalelivraison,
    idsuccursaleretour,
  } = body;

  const client = await Client.findByPk(idclient);
  if (!client) return { ok: false, message: "Client non trouvé" };

  const vehicule = await Vehicule.findByPk(idvehicule);
  if (!vehicule) return { ok: false, message: "Véhicule non trouvé" };

  const paiement = await Paiement.findByPk(idpaiement);
  if (!paiement) return { ok: false, message: "Paiement non trouvé" };

  const succLiv = await Succursale.findByPk(idsuccursalelivraison);
  if (!succLiv)
    return { ok: false, message: "Succursale livraison non trouvée" };

  const succRet = await Succursale.findByPk(idsuccursaleretour);
  if (!succRet) return { ok: false, message: "Succursale retour non trouvée" };

  return { ok: true };
}

// AFFICHER TOUTES LES RÉSERVATIONS OU FILTRÉES
exports.getReservations = asyncHandler(async (req, res) => {
  const {
    numeroreservation,
    //nom,
    //prenom,
    succursale,
    date_rdv,
    date_retour,
    date_creation,
  } = req.query;

  const where = {};

  if (numeroreservation)
    where.numeroreservation = { [Op.iLike]: `${numeroreservation}%` };
  //if (nom) where.nomclient = { [Op.iLike]: `%${nom}%` };
  //if (prenom) where.prenomclient = { [Op.iLike]: `%${prenom}%` };
  if (succursale) where.idsuccursalelivraison = succursale;
  if (date_rdv) where.daterdv = date_rdv;
  if (date_retour) where.dateretour = date_retour;
  if (date_creation) where.datereservation = date_creation;

  const reservations = await Reservation.findAll({ where });
  res.json(reservations);
});

// AFFICHER UNE RÉSERVATION PAR ID
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  res.json(reservation);
});

// CRÉER UNE NOUVELLE RÉSERVATION
exports.createReservation = asyncHandler(async (req, res) => {
  const check = await verifyForeignKeys(req.body);
  if (!check.ok) {
    res.status(400);
    throw new Error(check.message);
  }
  const newReservation = await Reservation.create(req.body);
  res.status(201).json(newReservation);
});

// METTRE À JOUR UNE RÉSERVATION
exports.updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  const check = await verifyForeignKeys({
    ...reservation.dataValues,
    ...req.body,
  });
  if (!check.ok) {
    res.status(400);
    throw new Error(check.message);
  }
  await reservation.update(req.body);
  res.json(reservation);
});

// SUPPRIMER UNE RÉSERVATION
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  await reservation.destroy();
  res.status(204).end();
});

// Vérifie la disponibilité d'une liste de véhicules pour une période donnée
exports.getDisponibilites = async (req, res) => {
  try {
    const { idsvehicules, datedebut, datefin } = req.body;
    console.log("BODY RECU:", req.body);
    if (!Array.isArray(idsvehicules) || !datedebut || !datefin) {
      return res
        .status(400)
        .json({ message: "Paramètres manquants ou invalides." });
    }

    // Cherche les réservations qui chevauchent la période pour ces véhicules
    const reservations = await Reservation.findAll({
      where: {
        idvehicule: { [Op.in]: idsvehicules },
        daterdv: { [Op.lte]: datefin },
        dateretour: { [Op.gte]: datedebut },
        statut: { [Op.notIn]: ["Annulée", "Terminée"] },
      },
    });

    // Liste des véhicules réservés sur la période
    const indisponibles = reservations.map((r) => r.idvehicule);

    // Filtre les véhicules disponibles
    const disponibles = idsvehicules.filter(
      (id) => !indisponibles.includes(id)
    );

    res.json({ disponibles });
  } catch (err) {
    console.error("Erreur Sequelize:", err);
    res.status(400).json({
      message: "Erreur lors de la vérification des disponibilités.",
      error: err.message,
    });
  }
};
// === FONCTIONS POUR LE DASHBOARD ===

// RÉCUPÉRER LES 5 DERNIÈRES RÉSERVATIONS
exports.getRecentReservations = asyncHandler(async (req, res) => {
  const recentReservations = await Reservation.findAll({
    order: [["datereservation", "DESC"]],
    limit: 5,
    include: [
      { model: Client, attributes: ["nom", "prenom"] },
      { model: Vehicule, attributes: ["marque", "modele"] },
    ],
  });
  res.json(recentReservations);
});

// RÉCUPÉRER LE NOMBRE DE RÉSERVATIONS ACTIVES
exports.getActiveReservationsCount = asyncHandler(async (req, res) => {
  const today = new Date();
  const count = await Reservation.count({
    where: {
      // Statut indiquant une location en cours ou confirmée
      statut: {
        [Op.in]: ["Confirmée", "Active"],
      },
      // La date de début est aujourd'hui ou dans le passé
      daterdv: {
        [Op.lte]: today,
      },
      // La date de fin est aujourd'hui ou dans le futur
      dateretour: {
        [Op.gte]: today,
      },
    },
  });
  res.json({ count });
});

// RÉCUPÉRER L'ÉVOLUTION MENSUELLE
exports.getMonthlyEvolution = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const results = await Reservation.findAll({
    attributes: [
      [
        Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("datereservation")),
        "month",
      ],
      [Sequelize.fn("COUNT", "*"), "count"],
    ],
    where: {
      datereservation: { [Op.gte]: twelveMonthsAgo },
    },
    group: [
      Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("datereservation")),
    ],
    order: [
      [
        Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("datereservation")),
        "ASC",
      ],
    ],
    raw: true,
  });
  const labels = results.map((row) =>
    new Date(row.month).toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    })
  );
  const data = results.map((row) => parseInt(row.count, 10));
  res.json({ labels, data });
});

// RÉCUPÉRER LE NOMBRE DE RÉSERVATIONS PAR SUCCURSALE
exports.getReservationCountBySuccursale = asyncHandler(async (req, res) => {
  const stats = await Reservation.findAll({
    attributes: [
      "idsuccursalelivraison",
      [Sequelize.fn("COUNT", "idreservation"), "reservationCount"],
    ],
    group: ["idsuccursalelivraison"],
  });
  res.json(stats);
});

// RÉCUPÉRER LES RÉSERVATIONS FILTRÉES
// Permet de filtrer les réservations selon plusieurs critères
// exports.getReservationsFiltrees = asyncHandler(async (req, res) => {
//   const {
//     numeroreservation,
//     nom,
//     prenom,
//     succursale,
//     date_livraison,
//     date_creation,
//   } = req.query;

//   const where = {};

//   if (numeroreservation) where.numeroreservation = numeroreservation;
//   if (nom) where.nomclient = { [Op.iLike]: `%${nom}%` };
//   if (prenom) where.prenomclient = { [Op.iLike]: `%${prenom}%` };
//   if (succursale) where.idsuccursalelivraison = succursale;
//   if (date_livraison) where.datelivraison = date_livraison;
//   if (date_creation) where.datereservation = date_creation;

//   const reservations = await Reservation.findAll({ where });
//   res.json(reservations);
// });
// RÉCUPÉRER LES 5 DERNIÈRES RÉSERVATIONS
exports.getRecentReservations = asyncHandler(async (req, res) => {
  const recentReservations = await Reservation.findAll({
    order: [["datereservation", "DESC"]],
    limit: 5,
    include: [
      { model: Client, attributes: ["nom", "prenom"] },
      { model: Vehicule, attributes: ["marque", "modele"] },
    ],
  });
  res.json(recentReservations);
});

// RÉCUPÉRER LE NOMBRE DE RÉSERVATIONS ACTIVES
exports.getActiveReservationsCount = asyncHandler(async (req, res) => {
  const today = new Date();
  const count = await Reservation.count({
    where: {
      statut: { [Op.in]: ["Confirmée", "Active"] },
      daterdv: { [Op.lte]: today },
      dateretour: { [Op.gte]: today },
    },
  });
  res.json({ count });
});

// RÉCUPÉRER LE TOP 3 DES VÉHICULES LES PLUS RÉSERVÉS
exports.getTopReservedVehicles = asyncHandler(async (req, res) => {
  const topVehicles = await Reservation.findAll({
    // 1. Compter les réservations et nommer le résultat 'reservationCount'
    attributes: [
      "idvehicule",
      [Sequelize.fn("COUNT", Sequelize.col("idvehicule")), "reservationCount"],
    ],

    // 2. Joindre la table Vehicule pour obtenir le nom du véhicule
    include: [
      {
        model: Vehicule,
        attributes: ["marque", "modele"], // On ne récupère que ce qui est utile
        required: true, // S'assurer que les réservations sans véhicule ne sont pas comptées
      },
    ],

    // 3. Grouper par ID de véhicule ET par les colonnes du véhicule inclus
    group: [
      "idvehicule",
      "Vehicule.idvehicule", // Sequelize demande de grouper aussi par les colonnes du modèle inclus
      "Vehicule.marque",
      "Vehicule.modele",
    ],

    // 4. Trier par le nombre de réservations, du plus grand au plus petit
    order: [[Sequelize.literal("reservationCount"), "DESC"]],

    // 5. Ne garder que les 3 premiers résultats
    limit: 3,

    // On enlève les métadonnées inutiles de Sequelize pour un résultat plus propre
    raw: true,
    nest: true,
  });

  res.json(topVehicles);
});

// RÉCUPÉRER LE TOP 3 DES SUCCURSALES PAR RÉSERVATION
// 🚨 Cette fonction doit retourner les succursales les plus utilisées (top 3)

exports.getTopSuccursalesByReservation = asyncHandler(async (req, res) => {
  const result = await Reservation.findAll({
    attributes: [
      "idsuccursalelivraison",
      [
        Sequelize.fn("COUNT", Sequelize.col("idsuccursalelivraison")),
        "reservationCount",
      ],
    ],
    group: ["idsuccursalelivraison"],
    order: [[Sequelize.literal("COUNT(idsuccursalelivraison)"), "DESC"]], // ✅ Fix ici
    limit: 3,
    raw: true,
  });

  res.json(result); // Exemple : [{ idsuccursalelivraison: 2, reservationCount: 20 }, ...]
});

/**
 * [ORCHESTRATION - Étape 1]
 * Initie le processus de checkout.
 * Calcule le prix total et crée une intention de paiement.
 */
// reservation-service/controllers/reservationController.js

// --- FONCTION D'ORCHESTRATION DU PAIEMENT ---
// --- FONCTION D'ORCHESTRATION DU PAIEMENT (MODIFIÉE) ---
exports.initiateCheckout = asyncHandler(async (req, res) => {
  console.log("--- [Reservation-Service] Début de initiateCheckout ---");
  console.log("[initiateCheckout] Body reçu:", req.body);
  try {
    const { idvehicule, datedebut, datefin, idclient, idsuccursalelivraison } =
      req.body;

    console.log(
      `[initiateCheckout] Appel à ${GATEWAY_URL}/vehicules/${idvehicule}`
    );
    console.log(
      `[initiateCheckout] Appel à ${GATEWAY_URL}/succursales/${idsuccursalelivraison}`
    );
    const [vehiculeResponse, succursaleDepartResponse] = await Promise.all([
      axios.get(`${GATEWAY_URL}/vehicules/${idvehicule}`),
      axios.get(`${GATEWAY_URL}/succursales/${idsuccursalelivraison}`),
    ]);
    const vehicule = vehiculeResponse.data;
    console.log("vehicule:", vehicule);
    const succursaleDepart = succursaleDepartResponse.data;
    console.log("[initiateCheckout] Succursale de départ:", succursaleDepart);

    // Vérification des dates
    console.log(
      `[initiateCheckout] datedebut: ${datedebut}, datefin: ${datefin}`
    );
    const nbJours = Math.max(
      1,
      differenceInDays(new Date(datefin), new Date(datedebut))
    );
    console.log(`[initiateCheckout] Nombre de jours calculé: ${nbJours}`);
    const montantTotalLocation = nbJours * vehicule.tarifjournalier;
    console.log(
      `[initiateCheckout] Montant total location (hors taxes): ${montantTotalLocation}`
    );

    // ✅ 3. APPEL AU SERVICE DE TAXES
    console.log(
      `[initiateCheckout] Appel à ${GATEWAY_URL}/taxes/calculate avec pays=${succursaleDepart.pays}, province=${succursaleDepart.province}, montant_hors_taxe=${montantTotalLocation}`
    );
    const taxeResponse = await axios.post(`${GATEWAY_URL}/taxes/calculate`, {
      pays: succursaleDepart.pays,
      province: succursaleDepart.province,
      montant_hors_taxe: montantTotalLocation,
    });
    const taxeInfo = taxeResponse.data;
    console.log("[initiateCheckout] Réponse taxe:", taxeInfo);

    // ... (logique de paiement Stripe...)
    console.log(
      "[initiateCheckout] Appel à Stripe pour créer l'intention de paiement..."
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(taxeInfo.montant_ttc) * 100), // Stripe attend des centimes
      currency: "cad", // ou 'usd'
      metadata: {
        idclient,
        idvehicule,
        // autres infos utiles
      },
    });
    const paiementIntentResponse = {
      data: {
        clientSecret: paymentIntent.client_secret,
        idintentstripe: paymentIntent.id,
      },
    };
    console.log(
      "[initiateCheckout] Réponse Stripe:",
      paiementIntentResponse.data
    );

    // ✅ 4. ON ENRICHIT LE RECAP AVEC LES TAXES ET TOUTES LES INFOS ATTENDUES
    const responsePayload = {
      clientSecret: paiementIntentResponse.data.clientSecret,
      idintentstripe: paiementIntentResponse.data.idintentstripe,
      recap: {
        vehicule, // Objet complet du véhicule
        succursaleDepart, // Objet complet de la succursale de départ
        datedebut,
        datefin,
        nbJours,
        montantTotalLocation: taxeInfo.montant_hors_taxe,
        taxes_detail: taxeInfo.taxes_detail,
        total_taxes: taxeInfo.total_taxes,
        montantTTC: taxeInfo.montant_ttc,

        // Ajoute ici d'autres champs si besoin (ex: montantDepot)
      },
    };
    console.log("[initiateCheckout] Payload de réponse:", responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error(
      "[initiateCheckout] ERREUR:",
      error && error.stack ? error.stack : error
    );
    if (error.response) {
      console.error(
        "[initiateCheckout] Erreur Axios:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        "[initiateCheckout] Aucune réponse reçue (Axios):",
        error.request
      );
    }
    res.status(500).json({
      message: "Erreur lors de l'initiation du paiement.",
      error: error.message,
    });
  }
});

// --- FONCTION DE FINALISATION DE LA RÉSERVATION (MODIFIÉE) ---
// --- FONCTION DE FINALISATION DE LA RÉSERVATION (SIMPLIFIÉE ET CORRIGÉE) ---
exports.finalizeReservation = asyncHandler(async (req, res) => {
  console.log("--- [Reservation-Service] Début de finalizeReservation ---");
  const transaction = await sequelize.transaction();

  try {
    const { idintentstripe, reservationDetails } = req.body;

    // 1. Vérifier que le paiement Stripe a réussi
    const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `Le paiement Stripe n'est pas confirmé. Statut: ${paymentIntent.status}`
      );
    }

    const details = reservationDetails.reservationData || reservationDetails;
    const recap = reservationDetails.recap;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const numeroReservationGenere = `RES-${Date.now()}-${randomSuffix}`;

    const reservationData = {
      numeroreservation: numeroReservationGenere,
      datereservation: new Date(),
      daterdv: new Date(details.datedebut),
      dateretour: new Date(details.datefin),
      montanttotal: parseFloat(recap.montantTotalLocation),
      taxes: parseFloat(recap.total_taxes),
      montantttc: parseFloat(recap.montantTTC),
      statut: "Confirmée",
      idclient: parseInt(details.idclient, 10),
      idsuccursalelivraison: parseInt(details.idsuccursalelivraison, 10),
      idsuccursaleretour: parseInt(details.idsuccursaleretour, 10),
      idvehicule: parseInt(details.idvehicule, 10),
    };

    // 2. Créer la réservation dans la transaction
    const nouvelleReservation = await Reservation.create(reservationData, {
      transaction,
    });
    console.log(
      `[finalizeReservation] Réservation ${nouvelleReservation.idreservation} créée.`
    );

    // 3. Enregistrer le détail des taxes dans la transaction
    if (recap.taxes_detail && recap.taxes_detail.length > 0) {
      const taxesToCreate = recap.taxes_detail.map((taxe) => ({
        idreservation: nouvelleReservation.idreservation,
        idtaxe: taxe.idtaxe,
      }));
      await TaxesReservation.bulkCreate(taxesToCreate, { transaction });
      console.log(
        `[finalizeReservation] Taxes enregistrées pour la réservation ${nouvelleReservation.idreservation}.`
      );
    }

    // 4. Valider la transaction (Commit)
    await transaction.commit();

    // 5. Renvoyer la nouvelle réservation au frontend.
    //    Le frontend l'utilisera sur la page de confirmation.
    res.status(201).json({
      message: "Réservation créée avec succès !",
      reservation: {
        ...nouvelleReservation.toJSON(),
        // On enrichit avec des infos utiles pour l'affichage de confirmation
        marque: recap.vehicule.marque,
        modele: recap.vehicule.modele,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("--- ERREUR DANS finalizeReservation ---", error);
    res.status(500).json({
      message: "Une erreur interne est survenue, la réservation a été annulée.",
      error: error.message,
    });
  }
});

exports.getMyReservations = asyncHandler(async (req, res) => {
  const idUtilisateur = req.user?.idutilisateur;
  const originalAuthHeader = req.headers["authorization"]; // On récupère l'en-tête d'autorisation original

  if (!idUtilisateur) {
    return res.status(401).json({
      message: "Utilisateur non authentifié ou ID manquant dans le token.",
    });
  }

  let idClient;

  // --- Étape 1 : Obtenir l'ID Client ---
  try {
    console.log(
      `[Reservation-Service] Recherche du client pour idUtilisateur: ${idUtilisateur}`
    );

    // ✅ MODIFICATION CRUCIALE DE L'APPEL AXIOS
    // On transmet l'en-tête d'autorisation original. Certains middlewares de Gateway
    // ou de service peuvent en avoir besoin pour router correctement la requête.
    const clientResponse = await axios.get(
      `${GATEWAY_URL}/clients/by-user/${idUtilisateur}`,
      {
        headers: {
          Authorization: originalAuthHeader,
        },
      }
    );

    idClient = clientResponse.data.idclient;
    console.log(`[Reservation-Service] Client trouvé, idClient: ${idClient}`);
  } catch (error) {
    // Log plus détaillé de l'erreur axios
    console.error(
      `[Reservation-Service] ERREUR lors de l'appel à Client-Service.`
    );
    if (error.response) {
      // L'erreur vient du service appelé (il a répondu avec un code d'erreur)
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Aucune réponse reçue du service client.");
    } else {
      // Erreur de configuration de la requête axios
      console.error("Erreur de configuration Axios:", error.message);
    }

    if (error.response?.status === 404) return res.json([]);
    return res
      .status(502)
      .json({ message: "Le service des clients est indisponible." });
  }

  // Le reste de votre fonction est correct, on ne le change pas.
  // ... (findAll, Promise.all, etc.) ...

  const basicReservations = await Reservation.findAll({
    where: { idclient: idClient },
    order: [["datereservation", "DESC"]],
    raw: true,
  });

  if (basicReservations.length === 0) return res.json([]);

  const vehicleIds = [
    ...new Set(basicReservations.map((r) => r.idvehicule)),
  ].filter(Boolean);
  const succursaleIds = [
    ...new Set(basicReservations.map((r) => r.idsuccursalelivraison)),
  ].filter(Boolean);

  try {
    const promises = [];
    if (vehicleIds.length > 0) {
      promises.push(
        axios.get(`${GATEWAY_URL}/vehicules?ids=${vehicleIds.join(",")}`)
      );
    }
    if (succursaleIds.length > 0) {
      promises.push(
        axios.get(`${GATEWAY_URL}/succursales?ids=${succursaleIds.join(",")}`)
      );
    }

    const responses = await Promise.all(promises);
    const vehiclesResponse =
      vehicleIds.length > 0 ? responses.shift() : { data: { vehicules: [] } };
    const succursalesResponse =
      succursaleIds.length > 0 ? responses.shift() : { data: [] };

    const vehiclesMap = new Map(
      vehiclesResponse.data.vehicules.map((v) => [v.idvehicule, v])
    );
    const succursalesMap = new Map(
      succursalesResponse.data.map((s) => [s.idsuccursale, s])
    );

    const enrichedReservations = basicReservations.map((reservation) => ({
      ...reservation,
      Vehicule: vehiclesMap.get(reservation.idvehicule) || null,
      Succursale: succursalesMap.get(reservation.idsuccursalelivraison) || null,
    }));

    res.json(enrichedReservations);
  } catch (error) {
    console.error(
      `Erreur lors de l'agrégation des véhicules/succursales:`,
      error.message
    );
    res.status(502).json({
      message:
        "Un service de données (véhicule ou succursale) est indisponible.",
    });
  }
});

/**
 * Récupère les détails d'UNE réservation spécifique pour l'utilisateur connecté.
 * Vérifie que la réservation appartient bien à l'utilisateur qui fait la demande.
 */
exports.getMyReservationById = asyncHandler(async (req, res) => {
  const idUtilisateur = req.user?.idutilisateur;
  const { id: idReservation } = req.params;
  const originalAuthHeader = req.headers["authorization"]; // On récupère l'en-tête original

  if (!idUtilisateur) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  let idClient;
  try {
    // ON AJOUTE L'EN-TÊTE D'AUTORISATION À L'APPEL
    const clientResponse = await axios.get(
      `${GATEWAY_URL}/clients/by-user/${idUtilisateur}`,
      { headers: { Authorization: originalAuthHeader } }
    );
    idClient = clientResponse.data.idclient;
  } catch (error) {
    console.error(
      "Erreur d'appel au Client-Service:",
      error.response?.status,
      error.response?.data
    );
    return res
      .status(502)
      .json({ message: "Le service des clients est indisponible." });
  }

  const reservation = await Reservation.findOne({
    where: { idreservation: idReservation, idclient: idClient },
    raw: true,
  });

  if (!reservation) {
    return res
      .status(404)
      .json({ message: "Réservation non trouvée ou accès non autorisé." });
  }

  try {
    // ON AJOUTE AUSSI L'EN-TÊTE ICI POUR PLUS DE ROBUSTESSE
    const options = { headers: { Authorization: originalAuthHeader } };

    const [
      vehicleResponse,
      succursaleDepartResponse,
      succursaleRetourResponse,
    ] = await Promise.all([
      axios.get(`${GATEWAY_URL}/vehicules/${reservation.idvehicule}`, options),
      axios.get(
        `${GATEWAY_URL}/succursales/${reservation.idsuccursalelivraison}`,
        options
      ),
      axios.get(
        `${GATEWAY_URL}/succursales/${reservation.idsuccursaleretour}`,
        options
      ),
    ]);

    const enrichedReservation = {
      ...reservation,
      Vehicule: vehicleResponse.data,
      SuccursaleDepart: succursaleDepartResponse.data,
      SuccursaleRetour: succursaleRetourResponse.data,
    };

    res.json(enrichedReservation);
  } catch (error) {
    console.error(
      "Erreur d'agrégation:",
      error.response?.status,
      error.response?.data
    );
    res.status(502).json({
      message:
        "Un service de données (véhicule ou succursale) est indisponible.",
    });
  }
});

//Fonction pour recuperer une reservation avec tous ses details
exports.getReservationFullDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers["authorization"]; // Récupère le token du frontend
  const options = { headers: { Authorization: authHeader } };
  try {
    // 1. Récupérer la réservation
    const reservation = await Reservation.findByPk(id, { raw: true });
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // 2. Récupérer le client
    const clientResponse = await axios.get(
      `${GATEWAY_URL}/clients/${reservation.idclient}`,
      options
    );
    const client = clientResponse.data;

    // 3. Récupérer le véhicule
    const vehiculeResponse = await axios.get(
      `${GATEWAY_URL}/vehicules/${reservation.idvehicule}`
    );
    const vehicule = vehiculeResponse.data;

    // 4. Récupérer les succursales
    const succLivResponse = await axios.get(
      `${GATEWAY_URL}/succursales/${reservation.idsuccursalelivraison}`
    );
    const succRetResponse = await axios.get(
      `${GATEWAY_URL}/succursales/${reservation.idsuccursaleretour}`
    );
    const succursaleLivraison = succLivResponse.data;
    const succursaleRetour = succRetResponse.data;

    // 5. Récupérer la dernière inspection du véhicule
    let inspection = null;
    try {
      const inspectionResponse = await axios.get(
        `${GATEWAY_URL}/inspections/last/${reservation.idvehicule}`
      );
      inspection = inspectionResponse.data;
    } catch (e) {
      inspection = null;
    }

    // 6. Récupérer les taxes appliquées à la réservation
    let taxes = [];
    try {
      const taxesResponse = await axios.get(
        `${GATEWAY_URL}/taxes/by-reservation/${id}`
      );
      taxes = taxesResponse.data;
    } catch (e) {
      taxes = [];
    }

    // 7. Retourner l'objet agrégé
    res.json({
      ...reservation,
      Client: client,
      Vehicule: vehicule,
      SuccursaleLivraison: succursaleLivraison,
      SuccursaleRetour: succursaleRetour,
      Inspection: inspection,
      Taxes: taxes, // <-- Ajout ici
    });
  } catch (error) {
    console.error("Erreur d'agrégation:", error.message);
    res.status(500).json({
      message: "Erreur lors de l'agrégation des données.",
      error: error.message,
    });
  }
});

//Mise a jour statut d'une reservation
exports.majStatutReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  reservation.statut = statut;
  await reservation.save();
  res.json(reservation);
});
