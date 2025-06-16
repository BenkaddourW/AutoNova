const Vehicule = require("../models/vehicule");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");

// Obtenir tous les vehicules avec filtres optionnels et pagination

    exports.getVehicules = asyncHandler(async (req, res) => {
    const {
      marque,
      categorie,
      statut,
      kilometrageMin,
      kilometrageMax,
      tarifjournalierMin,
      tarifjournalierMax,
      energie,
      transmission,
      siegesMin,
      siegesMax,
      succursaleidsuccursale,
      limit = 10,
      offset = 0,
    } = req.query;

    const where = {};

    if (marque) where.marque = { [Op.iLike]: `%${marque}%` };
    if (categorie) where.categorie = { [Op.iLike]: `%${categorie}%` };
    if (statut) where.statut = statut;
    if (energie) where.energie = energie;
    if (transmission) where.transmission = transmission;
    if (succursaleidsuccursale) where.succursaleidsuccursale = succursaleidsuccursale;

    if (kilometrageMin)
      where.kilometrage = { ...(where.kilometrage || {}), [Op.gte]: Number(kilometrageMin) };
    if (kilometrageMax)
      where.kilometrage = { ...(where.kilometrage || {}), [Op.lte]: Number(kilometrageMax) };

    if (tarifjournalierMin)
      where.tarifjournalier = { ...(where.tarifjournalier || {}), [Op.gte]: Number(tarifjournalierMin) };
    if (tarifjournalierMax)
      where.tarifjournalier = { ...(where.tarifjournalier || {}), [Op.lte]: Number(tarifjournalierMax) };

    if (siegesMin)
      where.sieges = { ...(where.sieges || {}), [Op.gte]: Number(siegesMin) };
    if (siegesMax)
      where.sieges = { ...(where.sieges || {}), [Op.lte]: Number(siegesMax) };

    const vehicules = await Vehicule.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json(vehicules);
});

// Obtenir un vehicule par ID


exports.getVehiculeById = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id);
  if (!vehicule) {
    res.status(404);
    throw new Error("Vehicule non trouve");
  }

  res.json(vehicule);
});

// Creer un vehicule
exports.createVehicule = asyncHandler(async (req, res) => {
  const nouveauVehicule = await Vehicule.create(req.body);
  res.status(201).json(nouveauVehicule);
});

// Mettre a jour un vehicule
exports.updateVehicule = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id);
  if (!vehicule) {
    res.status(404);
    throw new Error("Vehicule non trouve");
  }

  await vehicule.update(req.body);
  res.json(vehicule);
});

// Supprimer un vehicule
exports.deleteVehicule = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id);
  if (!vehicule) {
    res.status(404);
    throw new Error("Vehicule non trouve");
  }

  await vehicule.destroy();
  res.status(204).end();
});

