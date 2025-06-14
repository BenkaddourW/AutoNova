const Reservation = require("../models/reservation");
const Client = require("../models/client");
const Vehicule = require("../models/vehicule");
const Paiement = require("../models/paiement");
const Succursale = require("../models/succursale");



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

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const check = await verifyForeignKeys(req.body);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }
    const newReservation = await Reservation.create(req.body);
    res.status(201).json(newReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    const check = await verifyForeignKeys({ ...reservation.dataValues, ...req.body });
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }
    await reservation.update(req.body);
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    await reservation.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
