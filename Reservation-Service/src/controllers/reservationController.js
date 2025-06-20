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
  // CHANGEMENT 3: L'appel à verifyForeignKeys est supprimé
  /*
  const check = await verifyForeignKeys(req.body);
  if (!check.ok) {
    res.status(400);
    throw new Error(check.message);
  }
  */
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
  // CHANGEMENT 4: L'appel à verifyForeignKeys est supprimé
  /*
  const check = await verifyForeignKeys({
    ...reservation.dataValues,
    ...req.body,
  });
  if (!check.ok) {
    res.status(400);
    throw new Error(check.message);
  }
  */
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
    if (!Array.isArray(idsvehicules) || !datedebut || !datefin) {
      return res
        .status(400)
        .json({ message: "Paramètres manquants ou invalides." });
    }

    const reservations = await Reservation.findAll({
      where: {
        idvehicule: { [Op.in]: idsvehicules },
        [Op.or]: [
          {
            daterdv: { [Op.lte]: datefin },
            dateretour: { [Op.gte]: datedebut },
          },
          {
            daterdv: { [Op.between]: [datedebut, datefin] },
          },
          {
            dateretour: { [Op.between]: [datedebut, datefin] },
          },
        ],
      },
    });

    const indisponibles = reservations.map((r) => r.idvehicule);
    const disponibles = idsvehicules.filter(
      (id) => !indisponibles.includes(id)
    );

    res.json({ disponibles });
  } catch (err) {
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
      statut: { [Op.in]: ["Confirmée", "Active"] },
      daterdv: { [Op.lte]: today },
      dateretour: { [Op.gte]: today },
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
    include: [{ model: Succursale, as: 'succursaleLivraison', attributes: ['nom'] }] // Optionnel: pour avoir le nom de la succursale
  });
  res.json(stats);
});
