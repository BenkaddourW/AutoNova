const Reservation = require("../models/reservation");
const Client = require("../models/client");
const Vehicule = require("../models/vehicule");
const Paiement = require("../models/paiement");
const Succursale = require("../models/succursale");
const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");

async function verifyForeignKeys(body) {
  const { idclient, idvehicule, idpaiement, idsuccursalelivraison, idsuccursaleretour } = body;

  const client = await Client.findByPk(idclient);
  if (!client) return { ok: false, message: "Client non trouvé" };

  const vehicule = await Vehicule.findByPk(idvehicule);
  if (!vehicule) return { ok: false, message: "Véhicule non trouvé" };

  const paiement = await Paiement.findByPk(idpaiement);
  if (!paiement) return { ok: false, message: "Paiement non trouvé" };

  const succLiv = await Succursale.findByPk(idsuccursalelivraison);
  if (!succLiv) return { ok: false, message: "Succursale livraison non trouvée" };

  const succRet = await Succursale.findByPk(idsuccursaleretour);
  if (!succRet) return { ok: false, message: "Succursale retour non trouvée" };

  return { ok: true };
}

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
  const check = await verifyForeignKeys({ ...reservation.dataValues, ...req.body });
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

// === FONCTIONS POUR LE DASHBOARD ===

// RÉCUPÉRER LES 5 DERNIÈRES RÉSERVATIONS
exports.getRecentReservations = asyncHandler(async (req, res) => {
  const recentReservations = await Reservation.findAll({
    order: [['datereservation', 'DESC']],
    limit: 5,
    include: [
      { model: Client, attributes: ['nom', 'prenom'] },
      { model: Vehicule, attributes: ['marque', 'modele'] },
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
        [Op.in]: ['Confirmée', 'Active'], 
      },
      // La date de début est aujourd'hui ou dans le passé
      daterdv: {
        [Op.lte]: today,
      },
      // La date de fin est aujourd'hui ou dans le futur
      dateretour: {
        [Op.gte]: today,
      },
    }
  });
  res.json({ count });
});

// RÉCUPÉRER L'ÉVOLUTION MENSUELLE
exports.getMonthlyEvolution = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const results = await Reservation.findAll({
    attributes: [
      [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('datereservation')), 'month'],
      [Sequelize.fn('COUNT', '*'), 'count']
    ],
    where: {
      datereservation: { [Op.gte]: twelveMonthsAgo }
    },
    group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('datereservation'))],
    order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('datereservation')), 'ASC']],
    raw: true,
  });
  const labels = results.map(row => 
    new Date(row.month).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  );
  const data = results.map(row => parseInt(row.count, 10));
  res.json({ labels, data });
});

// RÉCUPÉRER LE NOMBRE DE RÉSERVATIONS PAR SUCCURSALE
exports.getReservationCountBySuccursale = asyncHandler(async (req, res) => {
  const stats = await Reservation.findAll({
    attributes: [
      'idsuccursalelivraison', 
      [Sequelize.fn('COUNT', 'idreservation'), 'reservationCount']
    ],
    group: ['idsuccursalelivraison'],
  });
  res.json(stats);
});
