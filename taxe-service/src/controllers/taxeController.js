const sequelize = require("../config/database");
const Taxe = require("../models/taxe");
const TaxeLocalite = require("../models/taxe_localite");
const TaxesContrat = require("../models/taxe_contrat")(
  sequelize,
  require("sequelize").DataTypes
);
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const TaxesReservation = require("../models/taxe_reservation")(
  sequelize,
  require("sequelize").DataTypes
);
TaxesReservation.belongsTo(Taxe, { foreignKey: "idtaxe", as: "taxe" });
TaxesContrat.belongsTo(Taxe, { foreignKey: "idtaxe", as: "taxe" });

/**
 * @desc Enregistre les taxes associées à un contrat
 * @route POST /api/taxes-contrat
 * @access Service interne
 * Body: [{ idcontrat, idtaxe, taux, denomination, montant }]
 */
exports.createTaxesContrat = asyncHandler(async (req, res) => {
  try {
    const taxes = req.body;
    if (!Array.isArray(taxes) || taxes.length === 0) {
      return res.status(400).json({ message: "Aucune taxe à enregistrer" });
    }
    // Adapter les champs pour correspondre à la table
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
  } catch (error) {
    console.error("Erreur bulkCreate taxes_contrat :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement des taxes contrat" });
  }
});

/** * @desc Récupère toutes les taxes, avec option de recherche par dénomination ou abréviation
 * @route GET /api/taxes   * @access Public
 */
exports.getTaxes = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let taxes;
  if (search) {
    taxes = await Taxe.findAll({
      where: {
        [Op.or]: [
          { denomination: { [Op.iLike]: `%${search}%` } }, // Cherche dans la dénomination
          { abrege: { [Op.iLike]: `%${search}%` } }, // OU cherche dans l'abréviation
        ],
      },
    });
  } else {
    taxes = await Taxe.findAll();
  }
  res.json(taxes);
});

/** * @desc Crée une nouvelle taxe
 * @route POST /api/taxes   * @access Admin
 */
exports.createTaxe = asyncHandler(async (req, res) => {
  const { denomination, abrege, taux, localites } = req.body;
  // localites doit être un tableau d'objets : [{ pays: "Canada", province: "Quebec" }, ...]
  if (!localites || !Array.isArray(localites) || localites.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une localité est requise" });
  }

  const nouvelleTaxe = await Taxe.create(
    {
      denomination,
      abrege,
      taux,
      localites, // Sequelize va créer les entrées dans taxe_localite
    },
    {
      include: [{ model: TaxeLocalite, as: "localites" }],
    }
  );
  res.status(201).json(nouvelleTaxe);
});

/** * @desc Met à jour une taxe existante
 * @route PUT /api/taxes/:id   * @access Admin
 */
exports.updateTaxe = asyncHandler(async (req, res) => {
  const { denomination, abrege, taux, localites } = req.body;
  const taxe = await Taxe.findByPk(req.params.id, {
    include: [{ model: TaxeLocalite, as: "localites" }],
  });

  if (!taxe) {
    res.status(404);
    throw new Error("Taxe non trouvée");
  }

  // Met à jour les champs principaux
  await taxe.update({ denomination, abrege, taux });

  // Si localites est fourni, on remplace les anciennes par les nouvelles
  if (localites && Array.isArray(localites)) {
    // Supprime les anciennes localités
    await TaxeLocalite.destroy({ where: { idtaxe: taxe.idtaxe } });
    // Ajoute les nouvelles localités
    const nouvellesLocalites = localites.map((loc) => ({
      idtaxe: taxe.idtaxe,
      pays: loc.pays,
      province: loc.province ?? null,
    }));
    await TaxeLocalite.bulkCreate(nouvellesLocalites);
  }

  // Recharge la taxe avec ses nouvelles localités
  const taxeMaj = await Taxe.findByPk(req.params.id, {
    include: [{ model: TaxeLocalite, as: "localites" }],
  });

  res.json(taxeMaj);
});

//supprimer une taxe
exports.deleteTaxe = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id);
  if (!taxe) {
    res.status(404);
    throw new Error("Taxe non trouvée");
  }
  await taxe.destroy();
  res.status(204).end();
});

/**
 * @desc Récupère les taxes applicables à une localité (pays + province)
 * @route GET /apicomment ca/taxes/localite?pays=Canada&province=Quebec
 * @access Public
 */
exports.getTaxesByLocalite = asyncHandler(async (req, res) => {
  const { pays, province } = req.query;
  if (!pays) {
    return res.status(400).json({ message: "Le pays est requis" });
  }

  const taxes = await Taxe.findAll({
    include: [
      {
        model: TaxeLocalite,
        as: "localites",
        where: {
          pays,
          [Op.or]: [{ province: province }, { province: null }],
        },
        required: true,
      },
    ],
  });

  res.json(taxes);
});

/** * @desc Récupère une seule taxe par son ID
 * @route GET /api/taxes/:id   * @access Public
 */
exports.getTaxeById = asyncHandler(async (req, res) => {
  const taxe = await Taxe.findByPk(req.params.id);
  if (!taxe) {
    res.status(404);
    throw new Error("Taxe non trouvée");
  }
  res.json(taxe);
});

/**
 * @desc Récupère les taxes appliquées à une réservation
 * @route GET /api/taxes/by-reservation/:id
 * @access Public
 */
exports.getTaxesByReservationId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const taxesReservation = await TaxesReservation.findAll({
    where: { idreservation: id },
    include: [
      {
        model: Taxe,
        as: "taxe",
        attributes: ["idtaxe", "denomination", "abrege", "taux"],
      },
    ],
  });

  const taxes = taxesReservation.map((tr) => ({
    idtaxe: tr.taxe.idtaxe,
    denomination: tr.taxe.denomination,
    abrege: tr.taxe.abrege,
    taux: tr.taxe.taux,
  }));

  res.json(taxes);
});

/**
 * @desc Récupère les taxes appliquées à un contrat
 * @route GET /api/taxes/by-contrat/:id
 * @access Public
 */
exports.getTaxesByContratId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const taxesContrat = await TaxesContrat.findAll({
    where: { idcontrat: id },
    include: [
      {
        model: Taxe,
        as: "taxe",
        attributes: ["idtaxe", "denomination", "abrege", "taux"],
      },
    ],
  });

  const taxes = taxesContrat.map((tc) => ({
    idtaxe: tc.taxe.idtaxe,
    denomination: tc.taxe.denomination,
    abrege: tc.taxe.abrege,
    taux: tc.taxe.taux,
    montant: tc.montant_taxe,
  }));

  res.json(taxes);
});
