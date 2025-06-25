const { Contrat, Inspection } = require("../models");

/**
 * Crée un contrat et, si fourni, une inspection associée.
 * Le body doit contenir les champs du contrat et un objet "inspection" optionnel.
 */
exports.creerContrat = async (req, res) => {
  const { inspection, ...contratData } = req.body;
  try {
    // Création du contrat
    const contrat = await Contrat.create(contratData);

    // Création de l'inspection si les données sont fournies
    let inspectionCree = null;
    if (inspection) {
      inspectionCree = await Inspection.create({
        ...inspection,
        idcontrat: contrat.idcontrat,
      });
    }

    res.status(201).json({
      contrat,
      inspection: inspectionCree,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du contrat et de l'inspection :",
      error
    );
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
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des contrats du client",
      });
  }
};
