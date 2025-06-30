// src/controllers/taxeController.js

// Importation de l'instance Sequelize depuis la configuration principale
const sequelize = require('../config/database'); 
const Taxe = require('../models/taxe');
const TaxeLocalite = require('../models/taxe_localite');
const TaxesReservation = require('../models/taxes_reservation');
const TaxesContrat = require('../models/taxe_contrat');  
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

// ==============================
// FONCTIONS DE LECTURE (GET)
// ==============================

/**
 * Récupère la liste des taxes, avec possibilité de filtrer par recherche textuelle.
 * Inclut les localités associées à chaque taxe.
 * @query {string} search - Terme de recherche sur la dénomination ou l'abrégé (optionnel)
 * @returns {Array} Liste des taxes avec leurs localités
 */
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

/**
 * Récupère une taxe par son identifiant, avec ses localités associées.
 * @param {number} id - Identifiant de la taxe
 * @returns {Object} Taxe avec ses localités
 */
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

// ==============================
// FONCTION DE CRÉATION (CREATE)
// ==============================

/**
 * Crée une nouvelle taxe et ses localités associées.
 * Utilise une transaction pour garantir l'intégrité des données.
 * @body {Object} taxeData - Données de la taxe et des localités associées
 * @returns {Object} Taxe créée avec ses localités
 */
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

// ==============================
// FONCTION DE MISE À JOUR (UPDATE)
// ==============================

/**
 * Met à jour une taxe existante ainsi que ses localités associées.
 * Utilise une transaction pour garantir la cohérence des modifications.
 * @param {number} id - Identifiant de la taxe à mettre à jour
 * @body {Object} taxeData - Nouvelles données de la taxe et des localités
 * @returns {Object} Taxe mise à jour avec ses localités
 */
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

// ==============================
// FONCTION DE SUPPRESSION (DELETE)
// ==============================

/**
 * Supprime une taxe ainsi que ses localités associées.
 * Utilise une transaction pour garantir la suppression atomique.
 * @param {number} id - Identifiant de la taxe à supprimer
 * @returns {void}
 */
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

// ==============================
// FONCTION DE LECTURE PAR LOCALITÉ
// ==============================

/**
 * Récupère les taxes applicables à une localité donnée (pays et province).
 * @query {string} pays - Pays concerné
 * @query {string} province - Province concernée
 * @returns {Array} Liste des taxes applicables à la localité
 */
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

/**
 * Calcule les taxes applicables pour une localité et un montant donné.
 * Retourne le détail de chaque taxe, le total des taxes et le montant TTC.
 * @body {string} pays - Pays concerné
 * @body {string} province - Province concernée
 * @body {number} montant_hors_taxe - Montant de base sur lequel appliquer les taxes
 * @returns {Object} Détail des taxes, total des taxes et montant TTC
 */
exports.calculateTaxes = asyncHandler(async (req, res) => {
    const { pays, province, montant_hors_taxe } = req.body;

    if (!pays || !province || montant_hors_taxe === undefined) {
        return res.status(400).json({ message: 'Les paramètres pays, province et montant_hors_taxe sont requis.' });
    }

    // 1. Recherche des taxes applicables à la localité
    const taxesApplicables = await Taxe.findAll({
        include: [{
            model: TaxeLocalite,
            as: 'localites',
            where: { pays, province },
            required: true // Ne retourne que les taxes qui ont une entrée pour cette localité
        }]
    });

    // 2. Calcul des montants de chaque taxe
    let totalTaxes = 0;
    const taxesDetail = taxesApplicables.map(taxe => {
        const montantTaxe = (Number(montant_hors_taxe) * parseFloat(taxe.taux)) / 100;
        totalTaxes += montantTaxe;
        return {
            idtaxe: taxe.idtaxe,
            denomination: taxe.denomination,
            abrege: taxe.abrege,
            taux: taxe.taux,
            montant: montantTaxe.toFixed(2)
        };
    });

    // 3. Préparation de la réponse
    const response = {
        montant_hors_taxe: Number(montant_hors_taxe).toFixed(2),
        taxes_detail: taxesDetail,
        total_taxes: totalTaxes.toFixed(2),
        montant_ttc: (Number(montant_hors_taxe) + totalTaxes).toFixed(2)
    };

    res.json(response);
});

// =================================================================
// FONCTIONS SPÉCIFIQUES AUX RÉSERVATIONS ET CONTRATS
// =================================================================

/**
 * Récupère les taxes appliquées à une réservation spécifique.
 * @route GET /by-reservation/:id
 * @param {number} id - Identifiant de la réservation
 * @returns {Array} Liste des taxes appliquées à la réservation
 */
exports.getTaxesByReservationId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const taxesReservation = await TaxesReservation.findAll({
    where: { idreservation: id },
    include: [{
      model: Taxe,
      as: "taxe",
      attributes: ["idtaxe", "denomination", "abrege", "taux"],
    }],
  });
  const taxes = taxesReservation.map((tr) => tr.taxe);
  res.json(taxes);
});

/**
 * Récupère les taxes appliquées à un contrat de location spécifique.
 * @route GET /by-contrat/:id
 * @param {number} id - Identifiant du contrat
 * @returns {Array} Liste des taxes appliquées au contrat
 */
exports.getTaxesByContratId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const taxesContrat = await TaxesContrat.findAll({
    where: { idcontrat: id },
  });
  // Formate la réponse pour garantir la cohérence des champs
  const taxes = taxesContrat.map((tc) => ({
    idtaxe: tc.idtaxe,
    denomination: tc.denomination_appliquee,
    abrege: tc.abrege_applique,
    taux: tc.taux_applique,
    montant: tc.montant_taxe,
  }));
  res.json(taxes);
});

/**
 * Enregistre un instantané des taxes appliquées à un contrat donné.
 * @route POST /taxes-contrat
 * @body {Array} taxes - Tableau d'objets taxe à enregistrer pour le contrat
 * @returns {Array} Liste des taxes enregistrées
 */
exports.createTaxesContrat = asyncHandler(async (req, res) => {
  const taxes = req.body;
  if (!Array.isArray(taxes) || taxes.length === 0) {
    return res.status(400).json({ message: "Le corps de la requête doit être un tableau de taxes." });
  }
  const taxesToInsert = taxes.map((taxe) => ({
    idcontrat: taxe.idcontrat,
    idtaxe: taxe.idtaxe,
    denomination_appliquee: taxe.denomination,
    abrege_applique: taxe.abrege,
    taux_applique: taxe.taux,
    montant_taxe: taxe.montant,
  }));
  const result = await TaxesContrat.bulkCreate(taxesToInsert);
  res.status(201).json(result);
});

