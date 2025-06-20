const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const Vehicule = require("../models/vehicule");
const VehiculeImage = require("../models/vehicule_image");
const sequelize = require("../config/database");
const axios = require("axios");

// --- Fonctions CRUD ---

exports.getVehicules = asyncHandler(async (req, res) => {
  const {
    search,
    marque,
    categorie,
    statut,
    limit = 10,
    offset = 0,
  } = req.query;
  let where = {};
  if (search) {
    where[Op.or] = [
      { immatriculation: { [Op.iLike]: `%${search}%` } },
      { marque: { [Op.iLike]: `%${search}%` } },
      { modele: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (marque) where.marque = { [Op.iLike]: `%${marque}%` };
  if (categorie) where.categorie = { [Op.iLike]: `%${categorie}%` };
  if (statut) where.statut = statut;

  try {
    const { count, rows } = await Vehicule.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["idvehicule", "ASC"]],
      include: [
        {
          model: VehiculeImage,
          as: "VehiculeImages", // Alias explicite pour éviter toute ambiguïté
          required: false, // LEFT JOIN pour inclure les véhicules même sans image
        },
      ],
      distinct: true, // Important pour un comptage correct avec `include`
    });
    res.json({ total: count, vehicules: rows });
  } catch (error) {
    console.error("ERREUR DANS getVehicules:", error); // Log complet de l'erreur côté serveur
    res.status(500).json({
      error:
        "Une erreur interne est survenue lors de la récupération des véhicules.",
    });
  }
});

exports.getVehiculeById = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id, {
    include: [{ model: VehiculeImage, as: "VehiculeImages" }],
  });
  if (!vehicule) {
    res.status(404);
    throw new Error("Vehicule non trouvé");
  }
  res.json(vehicule);
});

exports.createVehicule = asyncHandler(async (req, res) => {
  const { images, ...vehiculeData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const newVehicule = await Vehicule.create(vehiculeData, { transaction });
    if (images && images.length > 0) {
      const imageRecords = images.map((urlImage, index) => ({
        urlimage: urlImage,
        estprincipale: index === 0,
        idvehicule: newVehicule.idvehicule,
      }));
      await VehiculeImage.bulkCreate(imageRecords, { transaction });
    }
    await transaction.commit();
    const result = await Vehicule.findByPk(newVehicule.idvehicule, {
      include: [{ model: VehiculeImage, as: "VehiculeImages" }],
    });
    res.status(201).json(result);
  } catch (error) {
    await transaction.rollback();
    // Renvoyer les erreurs de validation Sequelize de manière structurée
    const errors = error.errors
      ? error.errors.map((e) => ({ field: e.path, message: e.message }))
      : [];
    res.status(400).json({ message: error.message, errors });
  }
});

exports.updateVehicule = asyncHandler(async (req, res) => {
  const { images, ...vehiculeData } = req.body;
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  try {
    const vehicule = await Vehicule.findByPk(id);
    if (!vehicule) {
      await transaction.rollback();
      return res.status(404).json({ error: "Véhicule non trouvé" });
    }
    await vehicule.update(vehiculeData, { transaction });

    // On ne met à jour les images que si le champ 'images' est présent dans la requête
    if (typeof images !== "undefined") {
      await VehiculeImage.destroy({ where: { idvehicule: id }, transaction });
      if (images && images.length > 0) {
        const imageRecords = images.map((urlImage, index) => ({
          urlimage: urlImage,
          estprincipale: index === 0,
          idvehicule: id,
        }));
        await VehiculeImage.bulkCreate(imageRecords, { transaction });
      }
    }
    await transaction.commit();
    const result = await Vehicule.findByPk(id, {
      include: [{ model: VehiculeImage, as: "VehiculeImages" }],
    });
    res.status(200).json(result);
  } catch (error) {
    await transaction.rollback();
    const errors = error.errors
      ? error.errors.map((e) => ({ field: e.path, message: e.message }))
      : [];
    res.status(400).json({ message: error.message, errors });
  }
});

// --- Fonctions de Statistiques (inchangées) ---
exports.getVehiculeCount = asyncHandler(async (req, res) => {
  const count = await Vehicule.count();
  res.json({ count });
});

exports.getVehiculeStatsBySuccursale = asyncHandler(async (req, res) => {
  const stats = await Vehicule.findAll({
    attributes: [
      "succursaleidsuccursale",
      [Sequelize.fn("COUNT", "idvehicule"), "vehiculeCount"],
    ],
    group: ["succursaleidsuccursale"],
  });
  res.json(stats);
});

exports.getVehiculeGeneralStats = asyncHandler(async (req, res) => {
  const [total, disponibles, en_location, en_maintenance, hors_service] =
    await Promise.all([
      Vehicule.count(),
      Vehicule.count({ where: { statut: "disponible" } }),
      Vehicule.count({ where: { statut: "en_location" } }),
      Vehicule.count({ where: { statut: "en_maintenance" } }),
      Vehicule.count({ where: { statut: "hors_service" } }),
    ]);
  res.json({ total, disponibles, en_location, en_maintenance, hors_service });
});

exports.getVehiculeFilterOptions = asyncHandler(async (req, res) => {
  const [marques, categories, energies, transmissions] = await Promise.all([
    Vehicule.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("marque")), "marque"],
      ],
      raw: true,
      order: ["marque"],
    }),
    Vehicule.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("categorie")), "categorie"],
      ],
      raw: true,
      order: ["categorie"],
    }),
    Vehicule.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("energie")), "energie"],
      ],
      raw: true,
      order: ["energie"],
    }),
    Vehicule.findAll({
      attributes: [
        [
          Sequelize.fn("DISTINCT", Sequelize.col("transmission")),
          "transmission",
        ],
      ],
      raw: true,
      order: ["transmission"],
    }),
  ]);
  res.json({
    marques: marques.map((item) => item.marque),
    categories: categories.map((item) => item.categorie),
    energies: energies.map((item) => item.energie),
    transmissions: transmissions.map((item) => item.transmission),
  });
});

exports.getVehiculeStatsByMarque = asyncHandler(async (req, res) => {
  const stats = await Vehicule.findAll({
    attributes: ["marque", [Sequelize.fn("COUNT", "idvehicule"), "count"]],
    group: ["marque"],
    order: [[Sequelize.fn("COUNT", "idvehicule"), "DESC"]],
    limit: 5,
  });
  res.json(stats);
});

// Recherche de véhicules disponibles selon critères
exports.getVehiculesDisponibles = async (req, res) => {
  try {
    const { idsuccursale, datedebut, datefin, modele, marque, categorie } =
      req.query;

    // 1. Recherche les véhicules correspondant aux critères de succursale et autres filtres
    const where = {};
    if (idsuccursale) where.succursaleidsuccursale = idsuccursale;
    if (modele) where.modele = modele;
    if (marque) where.marque = marque;
    if (categorie) where.categorie = categorie;

    const vehicules = await Vehicule.findAll({ where });

    if (!vehicules.length) {
      return res.json([]);
    }

    const idsvehicules = vehicules.map((v) => v.idvehicule);

    // 2. Appel au reservation-service pour vérifier la disponibilité (sans header Authorization)
    const response = await axios.post(
      "http://localhost:3000/reservations/disponibilites",
      {
        idsvehicules,
        datedebut,
        datefin,
      }
    );

    const disponibles = response.data.disponibles;

    // 3. Retourne uniquement les véhicules disponibles
    const vehiculesDisponibles = vehicules.filter((v) =>
      disponibles.includes(v.idvehicule)
    );

    res.json(vehiculesDisponibles);
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la recherche des véhicules disponibles.",
      error: err.message,
    });
  }
};
