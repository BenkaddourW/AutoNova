// CHANGEMENT 1: Importation des modèles depuis l'index centralisé
// On importe tous les modèles nécessaires depuis le fichier d'index du dossier 'models'
// Cela résout l'erreur "Reservation.findAll is not a function"
const {
  Reservation,
  Client,
  Vehicule,
  Paiement,
  Succursale,
} = require("../models");

// Les anciennes importations individuelles sont supprimées :
// const Reservation = require("../models/reservation");
// const Client = require("../models/client");
// etc...

const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");

// CHANGEMENT 2: La fonction verifyForeignKeys a été supprimée, comme demandé.
/*
async function verifyForeignKeys(body) {
  // ... contenu de la fonction supprimé
}
*/

// AFFICHER TOUTES LES RÉSERVATIONS
exports.getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.findAll();
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
// ✅ CORRECTION : Envelopper la fonction avec asyncHandler pour une gestion d'erreur robuste.
// Vérifie la disponibilité d'une liste de véhicules pour une période donnée
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

// ... (ajoutez ceci avec vos autres fonctions de dashboard)

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