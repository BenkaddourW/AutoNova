const Taxe = require('../models/taxe');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

exports.getTaxes = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let taxes;
  if (search) {
    taxes = await Taxe.findAll({
     where: {
  [Op.or]: [
    { denomination: { [Op.iLike]: `%${search}%` } }, // Cherche dans la dénomination
    { abrege: { [Op.iLike]: `%${search}%` } }      // OU cherche dans l'abréviation
  ]
}
    });
  } else {
    taxes = await Taxe.findAll();
  }
  res.json(taxes);
});

exports.getTaxeById = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id);
  if (!taxe) {
    res.status(404);
    throw new Error('Taxe non trouvée');
  }
  res.json(taxe);
});

exports.createTaxe = asyncHandler(async (req, res) => {
  const nouvelleTaxe = await Taxe.create(req.body);
  res.status(201).json(nouvelleTaxe);
});

exports.updateTaxe = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id);
  if (!taxe) {
    res.status(404);
    throw new Error('Taxe non trouvée');
  }
  await taxe.update(req.body);
  res.json(taxe);
});

exports.deleteTaxe = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id);
  if (!taxe) {
    res.status(404);
    throw new Error('Taxe non trouvée');
  }
  await taxe.destroy();
  res.status(204).end();
});
