const Succursale = require("../models/succursale");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");



// Récupérer toutes les succursales avec des filtres
exports.getSuccursales = asyncHandler(async (req, res) => {
   
    const {
      ville,
      province,
      pays,
      nomsuccursale,
      codeagence,
      codepostal,
      limit = 10,
      offset = 0,
    } = req.query;

    const where = {};

    if (ville) where.ville = { [Op.iLike]: `%${ville}%` };
    if (province) where.province = province;
    if (pays) where.pays = pays;
    if (nomsuccursale) where.nomsuccursale = { [Op.iLike]: `%${nomsuccursale}%` };
    if (codeagence) where.codeagence = { [Op.iLike]: `%${codeagence}%` };
    if (codepostal) where.codepostal = codepostal;

    const succursales = await Succursale.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json(succursales);
});
// Récupérer une succursale par son ID
exports.getSuccursaleById = asyncHandler(async (req, res) => {
  const succursale = await Succursale.findByPk(req.params.id);
  if (!succursale) {
    res.status(404);
    throw new Error("Succursale non trouvée");
  }

  res.json(succursale);
});
// Créer une nouvelle succursale
exports.createSuccursale = asyncHandler(async (req, res) => {

  const maxId = await Succursale.max('idsuccursale') || 0;
  req.body.codeagence = `AG-${String(maxId + 1).padStart(3, '0')}`;

  const nouvelleSuccursale = await Succursale.create(req.body);
  res.status(201).json(nouvelleSuccursale);
});

 // Mettre à jour les champs de la succursale
exports.updateSuccursale = asyncHandler(async (req, res) => {
  
  const succursale = await Succursale.findByPk(req.params.id);
  if (!succursale) {
    res.status(404);
    throw new Error("Succursale non trouvée");
  }
 
  await succursale.update(req.body);
  res.json(succursale);
});


// Récupérer le nombre total de succursales
exports.getSuccursaleCount = asyncHandler(async (req, res) => {
  const count = await Succursale.count();
  res.json({ count });
});

// Générer le prochain code agence
exports.getNextCode = asyncHandler(async (req, res) => {
  const maxId = await Succursale.max('idsuccursale') || 0;
  const codeagence = `AG-${String(maxId + 1).padStart(3, '0')}`;
  res.json({ codeagence });
});


exports.getAllSuccursalesList = async (req, res) => {
  try {
    const succursales = await Succursale.findAll({
      // On sélectionne seulement les colonnes dont le frontend a besoin
      attributes: ['idsuccursale', 'nomsuccursale'], 
      order: [['nomsuccursale', 'ASC']] // On trie par ordre alphabétique
    });
    res.status(200).json(succursales);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des succursales :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};