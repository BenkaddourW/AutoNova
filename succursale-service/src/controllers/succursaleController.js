// Fichier : src/controllers/succursaleController.js (Version Finale Corrigée)

const Succursale = require("../models/succursale");
const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize"); 

// Récupérer toutes les succursales avec des filtres (y compris par liste d'IDs)
exports.getSuccursales = asyncHandler(async (req, res) => {
    const {
      // ✅ ON AJOUTE LA LECTURE DU PARAMÈTRE 'ids'
      ids,
      ville, province, pays, nomsuccursale, codeagence, codepostal,
      limit = 10, offset = 0,
    } = req.query;

    const where = {};

    // ✅ SI DES IDs SONT FOURNIS, ON FILTRE PAR CETTE LISTE ET ON IGNORE LES AUTRES FILTRES
    if (ids) {
        // On transforme la chaîne "1,2,3" en un tableau de nombres [1, 2, 3]
        where.idsuccursale = { [Op.in]: ids.split(',').map(Number) };
    } else {
        // Sinon, on applique les filtres habituels
        if (ville) where.ville = { [Op.iLike]: `%${ville}%` };
        if (province) where.province = province;
        if (pays) where.pays = pays;
        if (nomsuccursale) where.nomsuccursale = { [Op.iLike]: `%${nomsuccursale}%` };
        if (codeagence) where.codeagence = { [Op.iLike]: `%${codeagence}%` };
        if (codepostal) where.codepostal = codepostal;
    }

    const succursales = await Succursale.findAll({
      where,
      // Si on filtre par ID, on ne veut pas de pagination, on les veut toutes.
      limit: ids ? undefined : Number(limit),
      offset: ids ? undefined : Number(offset),
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

// GET /succursales/all-list : retourne les noms, adresses et ids pour les menus
exports.getSuccursaleNamesList = asyncHandler(async (req, res) => {
  const succursales = await Succursale.findAll({
    // ✅ ON INCLUT L'ADRESSE COMPLÈTE
    attributes: ['idsuccursale', 'nomsuccursale', 'adresse1', 'ville', 'codepostal'],
    order: [['nomsuccursale', 'ASC']]
  });
  res.json(succursales);
});

// --- FONCTIONS POUR LA RECHERCHE DE LIEU STRUCTURÉE ---

// 1. Récupère la liste unique des pays
exports.getDistinctCountries = asyncHandler(async (req, res) => {
    const countries = await Succursale.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('pays')), 'country']],
        order: [['pays', 'ASC']], raw: true
    });
    res.json(countries.map(c => c.country));
});

// 2. Récupère la liste unique des provinces pour un pays donné
exports.getDistinctProvinces = asyncHandler(async (req, res) => {
    const { country } = req.query;
    if (!country) return res.status(400).json({ message: "Le paramètre 'country' est requis." });
    const provinces = await Succursale.findAll({
        where: { pays: country },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('province')), 'province']],
        order: [['province', 'ASC']], raw: true
    });
    res.json(provinces.map(p => p.province));
});

// 3. Récupère la liste unique des villes pour une combinaison pays/province
exports.getDistinctCities = asyncHandler(async (req, res) => {
    const { country, province } = req.query;
    if (!country || !province) return res.status(400).json({ message: "Les paramètres 'country' et 'province' sont requis." });
    const cities = await Succursale.findAll({
        where: { pays: country, province: province },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('ville')), 'city']],
        order: [['ville', 'ASC']], raw: true
    });
    res.json(cities.map(c => c.city));
});

// Cherche des IDs de succursales avec des critères stricts.
exports.findSuccursaleIds = asyncHandler(async (req, res) => {
    const { pays, province, ville } = req.query;
    const where = {};
    if (pays) where.pays = pays;
    if (province) where.province = province;
    if (ville) where.ville = { [Op.iLike]: ville }; 
    if (Object.keys(where).length === 0) return res.json([]);
    const succursales = await Succursale.findAll({ where, attributes: ['idsuccursale'], raw: true });
    res.json(succursales.map(s => s.idsuccursale));
});

// 4. Récupère la liste des succursales (ID et nom) pour une ville donnée
exports.getSuccursalesByLocation = asyncHandler(async (req, res) => {
    const { country, province, city } = req.query;
    if (!country || !province || !city) return res.status(400).json({ message: "Les paramètres 'country', 'province' et 'city' sont requis." });
    const succursales = await Succursale.findAll({
        where: { pays: country, province: province, ville: city },
        attributes: ['idsuccursale', 'nomsuccursale'],
        order: [['nomsuccursale', 'ASC']],
    });
    res.json(succursales);
});
