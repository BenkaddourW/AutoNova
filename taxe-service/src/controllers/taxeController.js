// src/controllers/taxeController.js (Version Finale avec le bon import)

// ✅ CORRECTION : Importer l'instance de sequelize depuis le bon fichier de configuration
const sequelize = require('../config/database'); 
const Taxe = require('../models/taxe');
const TaxeLocalite = require('../models/taxe_localite');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

// --- FONCTIONS DE LECTURE (GET) ---
exports.getTaxes = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = {};
  if (search) {
    where[Op.or] = [
      { denomination: { [Op.iLike]: `%${search}%` } },
      { abrege: { [Op.iLike]: `%${search}%` } }
    ];
  }
  const taxes = await Taxe.findAll({
    where,
    include: [{ model: TaxeLocalite, as: 'localites' }],
    order: [['idtaxe', 'ASC']]
  });
  res.json(taxes);
});

exports.getTaxeById = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id, {
    include: [{ model: TaxeLocalite, as: 'localites' }]
  });
  if (!taxe) {
    res.status(404);
    throw new Error('Taxe non trouvée');
  }
  res.json(taxe);
});

// --- FONCTION DE CRÉATION (CREATE) ---
exports.createTaxe = asyncHandler(async (req, res) => {
  const { localites, ...taxeData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const nouvelleTaxe = await Taxe.create(taxeData, { transaction });
    if (localites && Array.isArray(localites) && localites.length > 0) {
      const localitesData = localites.map(loc => ({
        ...loc,
        idtaxe: nouvelleTaxe.idtaxe
      }));
      await TaxeLocalite.bulkCreate(localitesData, { transaction });
    }
    await transaction.commit();
    const result = await Taxe.findByPk(nouvelleTaxe.idtaxe, {
      include: [{ model: TaxeLocalite, as: 'localites' }]
    });
    res.status(201).json(result);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// --- FONCTION DE MISE À JOUR (UPDATE) ---
exports.updateTaxe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { localites, ...taxeData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const taxe = await Taxe.findByPk(id, { transaction });
    if (!taxe) {
      res.status(404);
      throw new Error('Taxe non trouvée');
    }
    await taxe.update(taxeData, { transaction });
    if (localites && Array.isArray(localites)) {
      await TaxeLocalite.destroy({ where: { idtaxe: id }, transaction });
      if (localites.length > 0) {
        const localitesData = localites.map(loc => ({
          ...loc,
          idtaxe: id
        }));
        await TaxeLocalite.bulkCreate(localitesData, { transaction });
      }
    }
    await transaction.commit();
    const result = await Taxe.findByPk(id, {
      include: [{ model: TaxeLocalite, as: 'localites' }]
    });
    res.json(result);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// --- FONCTION DE SUPPRESSION (DELETE) ---
exports.deleteTaxe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
    try {
        await TaxeLocalite.destroy({ where: { idtaxe: id }, transaction });
        const taxe = await Taxe.findByPk(id);
        if (!taxe) {
            res.status(404);
            throw new Error('Taxe non trouvée');
        }
        await taxe.destroy({ transaction });
        await transaction.commit();
        res.status(204).end();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

// --- (getTaxesByLocalite reste inchangée) ---
exports.getTaxesByLocalite = asyncHandler(async (req, res) => {
  const { pays, province } = req.query;
  if (!pays || !province) {
    return res.status(400).json({ message: "Pays et province requis" });
  }
  const taxes = await Taxe.findAll({
    include: [{
      model: TaxeLocalite,
      as: 'localites',
      where: { pays, province }
    }]
  });
  res.json(taxes);
});
