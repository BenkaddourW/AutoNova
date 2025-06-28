/**
 * Reservation Controller
 * ---------------------
 * Gère toutes les opérations liées aux réservations : CRUD, statistiques, orchestration de paiement.
 * 
 * Dépendances :
 * - Modèles Sequelize (Reservation, Client, Vehicule, Paiement, Succursale)
 * - Stripe (paiement)
 * - Axios (appels inter-services)
 * 
 * Toutes les fonctions sont asynchrones et gèrent les erreurs via express-async-handler.
 */

const {
  Reservation,
  Client,
  Vehicule,
  Paiement,
  Succursale,
} = require("../models");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");
const axios = require('axios');
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

/**
 * Récupère toutes les réservations.
 * @route GET /reservations
 * @returns {Array} Liste des réservations
 */
exports.getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.findAll();
  res.json(reservations);
});

/**
 * Récupère une réservation par son ID.
 * @route GET /reservations/:id
 * @param {number} id - ID de la réservation
 * @returns {Object} Détails de la réservation
 */
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  res.json(reservation);
});

/**
 * Crée une nouvelle réservation.
 * @route POST /reservations
 * @body {Object} Données de la réservation
 * @returns {Object} Réservation créée
 */
exports.createReservation = asyncHandler(async (req, res) => {
  const newReservation = await Reservation.create(req.body);
  res.status(201).json(newReservation);
});

/**
 * Met à jour une réservation existante.
 * @route PUT /reservations/:id
 * @param {number} id - ID de la réservation
 * @body {Object} Données à mettre à jour
 * @returns {Object} Réservation mise à jour
 */
exports.updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  await reservation.update(req.body);
  res.json(reservation);
});

/**
 * Supprime une réservation.
 * @route DELETE /reservations/:id
 * @param {number} id - ID de la réservation
 * @returns {void}
 */
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }
  await reservation.destroy();
  res.status(204).end();
});

/**
 * Vérifie la disponibilité d'une liste de véhicules pour une période donnée.
 * @route POST /reservations/disponibilites
 * @body {Array} idsvehicules - Liste des IDs de véhicules
 * @body {string} datedebut - Date de début
 * @body {string} datefin - Date de fin
 * @returns {Array} IDs des véhicules disponibles
 */
exports.getDisponibilites = asyncHandler(async (req, res) => {
    const { idsvehicules, datedebut, datefin } = req.body;
    
    // La validation des paramètres est une bonne pratique.
    if (!Array.isArray(idsvehicules) || !datedebut || !datefin) {
      res.status(400); // Bad Request
      throw new Error("Les paramètres 'idsvehicules', 'datedebut' et 'datefin' sont requis et doivent être valides.");
    }

    // Recherche des réservations qui se chevauchent avec la période demandée.
    const reservations = await Reservation.findAll({
      where: {
        idvehicule: { [Op.in]: idsvehicules },
        [Op.or]: [
          { // Une réservation existante commence avant et se termine après la période demandée (englobante).
            daterdv: { [Op.lte]: datefin },
            dateretour: { [Op.gte]: datedebut },
          },
          { // Une réservation existante commence pendant la période demandée.
            daterdv: { [Op.between]: [datedebut, datefin] },
          },
          { // Une réservation existante se termine pendant la période demandée.
            dateretour: { [Op.between]: [datedebut, datefin] },
          },
        ],
      },
    });

    // On crée un Set des IDs des véhicules déjà réservés pour une recherche efficace.
    const indisponiblesIds = new Set(reservations.map((r) => r.idvehicule));
    
    // On filtre la liste initiale des IDs pour ne garder que ceux qui ne sont pas dans le Set des indisponibles.
    const disponibles = idsvehicules.filter(
      (id) => !indisponiblesIds.has(id)
    );

    res.json({ disponibles });
});


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
      statut: { [Op.in]: ["Confirmée", "Active"] },
      daterdv: { [Op.lte]: today },
      dateretour: { [Op.gte]: today },
    },
  });
  res.json({ count });
});

// RÉCUPÉRER LE NOMBRE DE RÉSERVATIONS PAR MOIS SUR LES 12 DERNIERS MOIS
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
    include: [{ model: Succursale, as: 'succursaleLivraison', attributes: ['nom'] }] // Optionnel: pour avoir le nom de la succursale
  });
  res.json(stats);
});


// DANS votre fichier reservationController.js



// RÉCUPÉRER LE TOP 3 DES VÉHICULES LES PLUS RÉSERVÉS
exports.getTopReservedVehicles = asyncHandler(async (req, res) => {
  const topVehicles = await Reservation.findAll({
    // 1. Compter les réservations et nommer le résultat 'reservationCount'
    attributes: [
      'idvehicule',
      [Sequelize.fn('COUNT', Sequelize.col('idvehicule')), 'reservationCount']
    ],
    
    // 2. Joindre la table Vehicule pour obtenir le nom du véhicule
    include: [{
      model: Vehicule,
      attributes: ['marque', 'modele'], // On ne récupère que ce qui est utile
      required: true // S'assurer que les réservations sans véhicule ne sont pas comptées
    }],
    
    // 3. Grouper par ID de véhicule ET par les colonnes du véhicule inclus
    group: [
      'idvehicule', 
      'Vehicule.idvehicule', // Sequelize demande de grouper aussi par les colonnes du modèle inclus
      'Vehicule.marque', 
      'Vehicule.modele'
    ],
    
    // 4. Trier par le nombre de réservations, du plus grand au plus petit
    order: [[Sequelize.literal('reservationCount'), 'DESC']],
    
    // 5. Ne garder que les 3 premiers résultats
    limit: 3,
    
    // On enlève les métadonnées inutiles de Sequelize pour un résultat plus propre
    raw: true,
    nest: true
  });
  
  res.json(topVehicles);
});

// RÉCUPÉRER LE TOP 3 DES SUCCURSALES PAR RÉSERVATION
// 🚨 Cette fonction doit retourner les succursales les plus utilisées (top 3)

exports.getTopSuccursalesByReservation = asyncHandler(async (req, res) => {
  const result = await Reservation.findAll({
    attributes: [
      'idsuccursalelivraison',
      [Sequelize.fn('COUNT', Sequelize.col('idsuccursalelivraison')), 'reservationCount'],
    ],
    group: ['idsuccursalelivraison'],
    order: [[Sequelize.literal('COUNT(idsuccursalelivraison)'), 'DESC']], // ✅ Fix ici
    limit: 3,
    raw: true
  });

  res.json(result); // Exemple : [{ idsuccursalelivraison: 2, reservationCount: 20 }, ...]
});



// // RÉCUPÉRER LES VÉHICULES LES PLUS RÉSERVÉS (TOP 3)
exports.getTopReservedVehicles = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 3;

  const topVehicles = await Reservation.findAll({
    attributes: [
      'idvehicule',
      [Sequelize.fn('COUNT', Sequelize.col('idvehicule')), 'reservationCount']
    ],
    group: ['idvehicule'],
    // ✅ CORRECTION : On trie par la fonction de comptage elle-même.
    order: [[Sequelize.fn('COUNT', Sequelize.col('idvehicule')), 'DESC']],
    limit: limit,
    raw: true
  });
  
  const topVehicleIds = topVehicles.map(v => v.idvehicule);
  res.json(topVehicleIds);
});



/**
 * [ORCHESTRATION - Étape 1]
 * Initie le processus de checkout.
 * Calcule le prix total et crée une intention de paiement.
 */
// reservation-service/controllers/reservationController.js

// --- FONCTION D'ORCHESTRATION DU PAIEMENT ---
exports.initiateCheckout = asyncHandler(async (req, res) => {
    console.log("--- [Reservation-Service] Début de initiateCheckout ---");
    try {
        const { idvehicule, datedebut, datefin, idclient } = req.body;
        console.log("1. Données reçues:", { idvehicule, datedebut, datefin, idclient });

        if (!idvehicule || !datedebut || !datefin || !idclient) {
            throw new Error("Données de réservation manquantes (véhicule, dates ou client).");
        }

        // Étape 1 : Récupérer les détails complets du véhicule via la Gateway
        console.log(`2. Appel à ${GATEWAY_URL}/vehicules/${idvehicule}`);
        const vehiculeResponse = await axios.get(`${GATEWAY_URL}/vehicules/${idvehicule}`);
        const vehicule = vehiculeResponse.data;

        if (!vehicule || !vehicule.tarifjournalier) {
            throw new Error("Impossible de récupérer les détails ou le tarif du véhicule.");
        }
        console.log("3. Véhicule récupéré avec succès.");

        // Étape 2 : Calculer le prix de la location (sans taxes pour le moment)
        const nbJours = Math.max(1, new Date(datefin).getDate() - new Date(datedebut).getDate());
        const montantTotalLocation = nbJours * vehicule.tarifjournalier;
        console.log(`4. Calcul du prix: ${nbJours} jours * ${vehicule.tarifjournalier}$ = ${montantTotalLocation}$`);

        // Étape 3 : Définir le montant du dépôt
        const MONTANT_DEPOT_EN_CENTIMES = 50 * 100;

        // Étape 4 : Préparer et appeler le service de paiement
        const payloadPaiement = {
            amount: MONTANT_DEPOT_EN_CENTIMES,
            currency: 'cad',
            metadata: { idclient, idvehicule, montantTotalEstime: montantTotalLocation.toFixed(2) }
        };
        console.log("5. Appel à /paiements/intent avec:", payloadPaiement);
        const paiementIntentResponse = await axios.post(`${GATEWAY_URL}/paiements/intent`, payloadPaiement);
        console.log("6. Réponse du service de paiement reçue.");

        if (!paiementIntentResponse.data || !paiementIntentResponse.data.clientSecret) {
            throw new Error("La réponse du service de paiement est invalide.");
        }

        // Étape 5 : Renvoyer la réponse complète et bien formée au frontend
        const responsePayload = {
            clientSecret: paiementIntentResponse.data.clientSecret,
            idintentstripe: paiementIntentResponse.data.idintentstripe,
            recap: {
                montantTotalLocation: montantTotalLocation.toFixed(2),
                montantDepot: (50.00).toFixed(2),
                taxes: (0.00).toFixed(2), // On met 0 en attendant de réactiver le service
                montantTTC: montantTotalLocation.toFixed(2), // TTC = HT pour l'instant
                nbJours,
                vehicule,
            }
        };
        console.log("7. Envoi de la réponse finale au frontend.");
        res.json(responsePayload);

    } catch (error) {
        console.error("--- ERREUR DANS initiateCheckout ---");
        // Log détaillé de l'erreur pour le débogage
        if (error.response) {
            console.error('Erreur de réponse d\'un service appelé:', { 
                status: error.response.status, 
                data: error.response.data 
            });
        } else {
            console.error('Erreur générale:', error.message);
        }
        res.status(500).json({ message: "Une erreur interne est survenue lors de l'initialisation du paiement." });
    }
});


// --- VOS AUTRES FONCTIONS (CRUD, STATS, etc.) ---
// (Le reste de votre fichier peut rester tel quel)
// ...

/**
 * [ORCHESTRATION]
 * Finalise la réservation après le paiement du dépôt.
 */
/**
 * [ORCHESTRATION]
 * Finalise la réservation après le paiement du dépôt.
 */
exports.finalizeReservation = asyncHandler(async (req, res) => {
    console.log("--- [Reservation-Service] Début de finalizeReservation ---");
    
    let nouvelleReservation; 

    try {
        const { idintentstripe, reservationDetails } = req.body;
        
        if (!idintentstripe || !reservationDetails) {
            throw new Error("Données de finalisation manquantes.");
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(idintentstripe);
        if (paymentIntent.status !== "succeeded") {
            throw new Error(`Le paiement n'est pas confirmé. Statut : ${paymentIntent.status}`);
        }
        
        // ✅ CORRECTION : On utilise les bonnes données de réservation
        const details = reservationDetails.reservationData || reservationDetails;
        
        // ✅ CORRECTION DÉFINITIVE : ON GÉNÈRE LE NUMÉRO ICI
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const numeroReservationGenere = `RES-${Date.now()}-${randomSuffix}`;
        
        const reservationData = {
            numeroreservation: numeroReservationGenere, // On ajoute le numéro qu'on vient de générer
            datereservation: new Date(),
            daterdv: new Date(details.datedebut),
            dateretour: new Date(details.datefin),
            montanttotal: parseFloat(reservationDetails.recap.montantTotalLocation),
            taxes: 0.00,
            montantttc: 50.00,
            statut: 'En attente',
            idclient: parseInt(details.idclient, 10),
            idsuccursalelivraison: parseInt(details.idsuccursalelivraison, 10),
            idsuccursaleretour: parseInt(details.idsuccursaleretour, 10),
            idvehicule: parseInt(details.idvehicule, 10),
        };
        
        console.log("Données envoyées à Reservation.create:", reservationData); // Log de débogage
        
        nouvelleReservation = await Reservation.create(reservationData);
        console.log(`Réservation ${nouvelleReservation.idreservation} créée. Tentative d'enregistrement du paiement...`);

        const paiementPayload = {
            idintentstripe,
            montant: 50.00,
            
            idreservation: nouvelleReservation.idreservation,
            modepaiement: 'card',
        };
        await axios.post(`${GATEWAY_URL}/paiements/enregistrer`, paiementPayload);
        console.log("Paiement enregistré pour la réservation " + nouvelleReservation.idreservation);

        res.status(201).json({
            message: "Dépôt payé et réservation confirmée avec succès !",
            reservation: nouvelleReservation
        });

    } catch (error) {
        console.error("--- ERREUR DANS finalizeReservation ---");
        
        if (nouvelleReservation) {
            console.error(`L'enregistrement du paiement a échoué. Annulation de la réservation ${nouvelleReservation.idreservation}...`);
            await nouvelleReservation.destroy();
            console.error("Réservation annulée.");
        }
        
        console.error('Erreur détaillée:', error);
        res.status(500).json({ message: "Une erreur interne est survenue, la réservation a été annulée." });
    }
});




exports.getMyReservations = asyncHandler(async (req, res) => {
  const idUtilisateur = req.user?.idutilisateur;
  const originalAuthHeader = req.headers['authorization']; // On récupère l'en-tête d'autorisation original

  if (!idUtilisateur) {
    return res.status(401).json({ message: "Utilisateur non authentifié ou ID manquant dans le token." });
  }

  let idClient;
  
  // --- Étape 1 : Obtenir l'ID Client ---
  try {
    console.log(`[Reservation-Service] Recherche du client pour idUtilisateur: ${idUtilisateur}`);
    
    // ✅ MODIFICATION CRUCIALE DE L'APPEL AXIOS
    // On transmet l'en-tête d'autorisation original. Certains middlewares de Gateway
    // ou de service peuvent en avoir besoin pour router correctement la requête.
    const clientResponse = await axios.get(
      `${GATEWAY_URL}/clients/by-user/${idUtilisateur}`,
      {
        headers: {
          'Authorization': originalAuthHeader 
        }
      }
    );
    
    idClient = clientResponse.data.idclient;
    console.log(`[Reservation-Service] Client trouvé, idClient: ${idClient}`);
    
  } catch (error) {
    // Log plus détaillé de l'erreur axios
    console.error(`[Reservation-Service] ERREUR lors de l'appel à Client-Service.`);
    if (error.response) {
      // L'erreur vient du service appelé (il a répondu avec un code d'erreur)
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue du service client.');
    } else {
      // Erreur de configuration de la requête axios
      console.error('Erreur de configuration Axios:', error.message);
    }

    if (error.response?.status === 404) return res.json([]);
    return res.status(502).json({ message: "Le service des clients est indisponible." });
  }

  // Le reste de votre fonction est correct, on ne le change pas.
  // ... (findAll, Promise.all, etc.) ...
  
  const basicReservations = await Reservation.findAll({
    where: { idclient: idClient },
    order: [['datereservation', 'DESC']],
    raw: true,
  });

  if (basicReservations.length === 0) return res.json([]);
  
  const vehicleIds = [...new Set(basicReservations.map(r => r.idvehicule))].filter(Boolean);
  const succursaleIds = [...new Set(basicReservations.map(r => r.idsuccursalelivraison))].filter(Boolean);

  try {
    const promises = [];
    if (vehicleIds.length > 0) {
      promises.push(axios.get(`${GATEWAY_URL}/vehicules?ids=${vehicleIds.join(',')}`));
    }
    if (succursaleIds.length > 0) {
      promises.push(axios.get(`${GATEWAY_URL}/succursales?ids=${succursaleIds.join(',')}`));
    }

    const responses = await Promise.all(promises);
    const vehiclesResponse = vehicleIds.length > 0 ? responses.shift() : { data: { vehicules: [] } };
    const succursalesResponse = succursaleIds.length > 0 ? responses.shift() : { data: [] };

    const vehiclesMap = new Map(vehiclesResponse.data.vehicules.map(v => [v.idvehicule, v]));
    const succursalesMap = new Map(succursalesResponse.data.map(s => [s.idsuccursale, s]));

    const enrichedReservations = basicReservations.map(reservation => ({
      ...reservation,
      Vehicule: vehiclesMap.get(reservation.idvehicule) || null,
      Succursale: succursalesMap.get(reservation.idsuccursalelivraison) || null,
    }));

    res.json(enrichedReservations);
  } catch(error) {
      console.error(`Erreur lors de l'agrégation des véhicules/succursales:`, error.message);
      res.status(502).json({ message: "Un service de données (véhicule ou succursale) est indisponible." });
  }
});


/**
 * Récupère les détails d'UNE réservation spécifique pour l'utilisateur connecté.
 * Vérifie que la réservation appartient bien à l'utilisateur qui fait la demande.
 */
exports.getMyReservationById = asyncHandler(async (req, res) => {
  const idUtilisateur = req.user?.idutilisateur;
  const { id: idReservation } = req.params;
  const originalAuthHeader = req.headers['authorization']; // On récupère l'en-tête original

  if (!idUtilisateur) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  let idClient;
  try {
    // ON AJOUTE L'EN-TÊTE D'AUTORISATION À L'APPEL
    const clientResponse = await axios.get(
        `${GATEWAY_URL}/clients/by-user/${idUtilisateur}`,
        { headers: { 'Authorization': originalAuthHeader } }
    );
    idClient = clientResponse.data.idclient;
  } catch (error) {
    console.error("Erreur d'appel au Client-Service:", error.response?.status, error.response?.data);
    return res.status(502).json({ message: "Le service des clients est indisponible." });
  }

  const reservation = await Reservation.findOne({
    where: { idreservation: idReservation, idclient: idClient },
    raw: true,
  });

  if (!reservation) {
    return res.status(404).json({ message: "Réservation non trouvée ou accès non autorisé." });
  }
  
  try {
    // ON AJOUTE AUSSI L'EN-TÊTE ICI POUR PLUS DE ROBUSTESSE
    const options = { headers: { 'Authorization': originalAuthHeader } };
    
    const [vehicleResponse, succursaleDepartResponse, succursaleRetourResponse] = await Promise.all([
      axios.get(`${GATEWAY_URL}/vehicules/${reservation.idvehicule}`, options),
      axios.get(`${GATEWAY_URL}/succursales/${reservation.idsuccursalelivraison}`, options),
      axios.get(`${GATEWAY_URL}/succursales/${reservation.idsuccursaleretour}`, options)
    ]);

    const enrichedReservation = {
      ...reservation,
      Vehicule: vehicleResponse.data,
      SuccursaleDepart: succursaleDepartResponse.data,
      SuccursaleRetour: succursaleRetourResponse.data,
    };

    res.json(enrichedReservation);
  } catch (error) {
    console.error("Erreur d'agrégation:", error.response?.status, error.response?.data);
    res.status(502).json({ message: "Un service de données (véhicule ou succursale) est indisponible." });
  }
});