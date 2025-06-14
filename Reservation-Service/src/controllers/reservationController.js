const Reservation = require("../models/reservation");
const Client = require("../models/client");
const Vehicule = require("../models/vehicule");
const Paiement = require("../models/paiement");
const Succursale = require("../models/succursale");
const asyncHandler = require("express-async-handler");



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
// afficher toutes les réservations
exports.getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.findAll();
  res.json(reservations);
});

// afficher une réservation par ID
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }

  res.json(reservation);
});

// créer une nouvelle réservation
exports.createReservation = asyncHandler(async (req, res) => {
  const check = await verifyForeignKeys(req.body);
  if (!check.ok) {
    res.status(400);
    throw new Error(check.message);
  }
  // Vérification des données requises
  const newReservation = await Reservation.create(req.body);
  res.status(201).json(newReservation);
});

// mettre à jour une réservation
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

// supprimer une réservation
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }

  await reservation.destroy();
  res.status(204).end();
});
