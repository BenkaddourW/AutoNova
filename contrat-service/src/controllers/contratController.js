const { Contrat, Inspection } = require("../models");

const axios = require("axios");

/**
 * Crée un contrat à partir d'une réservation et enregistre les taxes associées.
 * Le body doit contenir l'objet réservation (avec Taxes).
 */
exports.creerContrat = async (req, res) => {
  try {
    const reservation = req.body;

    const contratData = {
      date: Date.now(),
      montant: reservation.montanttotal,
      montantttc: reservation.montantttc,
      statut: "brouillon",
      idreservation: reservation.idreservation,
      dateretourprevue: reservation.dateretour,
      dateretour: null,
      montantpenalite: 0,
      taxes: reservation.taxes,
      montantremboursement: 0,
    };

    // Création du contrat
    const contratCree = await Contrat.create(contratData);

    // Préparation des taxes à enregistrer
    const taxesContrat = (reservation.Taxes || []).map((taxe) => ({
      idcontrat: contratCree.idcontrat,
      idtaxe: taxe.idtaxe,
      taux: taxe.taux,
      denomination: taxe.denomination,
      montant: null, // à calculer si besoin
    }));

    // Appel au service taxe pour enregistrer les taxes associées au contrat
    if (taxesContrat.length > 0) {
      await axios.post(
        "http://localhost:3009/taxes/taxes-contrat", // URL du service taxe
        taxesContrat
      );
    }

    res.status(201).json({
      message: "Contrat créé avec taxes associées",
      contrat: contratCree,
    });
  } catch (err) {
    console.error("Erreur lors de la création du contrat :", err);
    res.status(500).json({ message: "Erreur lors de la création du contrat" });
  }
};

/** * Met à jour le statut d'un contrat.
 * Autorisé aux employés et admins.
 * Le body doit contenir les champs à mettre à jour.
 */
exports.majStatutContrat = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body; // ex: { "statut": "valide" }
  try {
    const contrat = await Contrat.findByPk(id);
    if (!contrat)
      return res.status(404).json({ message: "Contrat non trouvé" });

    contrat.statut = statut;
    await contrat.save();

    res.json({ message: "Statut mis à jour", contrat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

/**
 * Liste tous les contrats avec leurs inspections associées.
 * Accessible uniquement aux employés et admins.
 * Retourne un tableau de contrats, chaque contrat incluant
 * ses inspections.
 */
exports.listerContrats = async (req, res) => {
  try {
    // Récupère tous les contrats, avec éventuellement les inspections associées
    const contrats = await Contrat.findAll({
      include: [
        {
          model: Inspection,
          as: "inspections",
        },
      ],
      order: [["date", "DESC"]], // Optionnel : tri du plus récent au plus ancien
    });
    res.json(contrats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des contrats" });
  }
};

/**
 * Liste tous les contrats du client connecté.
 * Accessible uniquement aux clients.
 * Retourne un tableau de contrats, chaque contrat incluant ses inspections.
 */
exports.listerContratsClient = async (req, res) => {
  try {
    // On suppose que l'id du client est dans le token JWT (ex: req.user.idclient)
    const idclient = req.user.idclient;
    if (!idclient) {
      return res.status(400).json({ message: "Client non identifié." });
    }

    // On suppose que la table Contrat a une clé étrangère vers Reservation, qui a idclient
    const contrats = await Contrat.findAll({
      include: [
        {
          model: Inspection,
          as: "inspections",
        },
        {
          model: Reservation,
          as: "reservation",
          where: { idclient },
          required: true,
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json(contrats);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des contrats du client",
    });
  }
};

/** * Récupère un contrat par son ID.
 * Autorisé aux employés et admins.
 * Retourne le contrat avec ses inspections associées et ses taxes.
 */
exports.getContratById = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Récupère le contrat et ses inspections
    const contrat = await Contrat.findByPk(id, {
      include: [
        {
          model: Inspection,
          as: "inspections",
        },
      ],
    });
    if (!contrat) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    // 2. Récupère les taxes via le service taxe
    let taxes = [];
    try {
      const taxeResponse = await axios.get(
        `http://localhost:3000/taxes/by-contrat/${id}`
      );
      taxes = taxeResponse.data;
    } catch (taxeErr) {
      console.error(
        "Erreur lors de la récupération des taxes du contrat :",
        taxeErr.message
      );
    }

    // 3. Récupère la réservation (et donc le véhicule et le client) via le service réservation
    let reservation = null;
    try {
      const reservationResponse = await axios.get(
        `http://localhost:3000/reservations/${contrat.idreservation}/full-details`,
        {
          headers: {
            Authorization: req.headers.authorization, // transmet le même token reçu par le backend
          },
        }
      );
      reservation = reservationResponse.data;
    } catch (resErr) {
      console.error(
        "Erreur lors de la récupération de la réservation :",
        resErr.message
      );
    }

    // 4. Retourne tout dans la réponse
    const contratWithDetails = {
      ...contrat.toJSON(),
      taxes,
      reservation, // contient aussi le véhicule et le client si le service réservation les inclut
    };

    res.json(contratWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du contrat" });
  }
};
