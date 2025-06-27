/**
 * Contrôleur Succursale
 * ---------------------
 * Gère toutes les opérations liées aux succursales : CRUD, recherche, statistiques, et listes structurées pour les filtres.
 * Utilise Sequelize pour l'accès aux données et express-async-handler pour la gestion des erreurs asynchrones.
 */

const Succursale = require("../models/succursale");
const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize"); 

/**
 * Récupère toutes les succursales avec filtres (par IDs ou critères classiques).
 * @route GET /succursales
 * @param {Object} req - Requête Express contenant les filtres en query (ids, ville, province, pays, etc.).
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des succursales correspondant aux critères.
 */
exports.getSuccursales = asyncHandler(async (req, res) => {
    const {
      ids, ville, province, pays, nomsuccursale, codeagence, codepostal,
      limit = 10, offset = 0,
    } = req.query;

    const where = {};

    // Si des IDs sont fournis, on filtre uniquement par cette liste
    if (ids) {
        // Convertit "1,2,3" en [1,2,3]
        where.idsuccursale = { [Op.in]: ids.split(',').map(Number) };
    } else {
        // Sinon, on applique les filtres classiques
        if (ville) where.ville = { [Op.iLike]: `%${ville}%` };
        if (province) where.province = province;
        if (pays) where.pays = pays;
        if (nomsuccursale) where.nomsuccursale = { [Op.iLike]: `%${nomsuccursale}%` };
        if (codeagence) where.codeagence = { [Op.iLike]: `%${codeagence}%` };
        if (codepostal) where.codepostal = codepostal;
    }

    // Si on filtre par ID, on retourne tout sans pagination
    const succursales = await Succursale.findAll({
      where,
      limit: ids ? undefined : Number(limit),
      offset: ids ? undefined : Number(offset),
    });
    res.json(succursales);
});

/**
 * Récupère une succursale par son ID.
 * @route GET /succursales/:id
 * @param {Object} req - Requête Express contenant l'ID en paramètre.
 * @param {Object} res - Réponse Express.
 * @returns {Object} Succursale trouvée ou erreur 404.
 */
exports.getSuccursaleById = asyncHandler(async (req, res) => {
  const succursale = await Succursale.findByPk(req.params.id);
  if (!succursale) {
    res.status(404);
    throw new Error("Succursale non trouvée");
  }
  res.json(succursale);
});

/**
 * Crée une nouvelle succursale avec génération automatique du code agence.
 * @route POST /succursales
 * @param {Object} req - Requête Express contenant les données de la succursale.
 * @param {Object} res - Réponse Express.
 * @returns {Object} Succursale créée.
 */
exports.createSuccursale = asyncHandler(async (req, res) => {
  const maxId = await Succursale.max('idsuccursale') || 0;
  req.body.codeagence = `AG-${String(maxId + 1).padStart(3, '0')}`;
  const nouvelleSuccursale = await Succursale.create(req.body);
  res.status(201).json(nouvelleSuccursale);
});

/**
 * Met à jour une succursale existante.
 * @route PUT /succursales/:id
 * @param {Object} req - Requête Express contenant l'ID et les nouvelles données.
 * @param {Object} res - Réponse Express.
 * @returns {Object} Succursale mise à jour.
 */
exports.updateSuccursale = asyncHandler(async (req, res) => {
  const succursale = await Succursale.findByPk(req.params.id);
  if (!succursale) {
    res.status(404);
    throw new Error("Succursale non trouvée");
  }
  await succursale.update(req.body);
  res.json(succursale);
});

/**
 * Récupère le nombre total de succursales.
 * @route GET /succursales/count
 * @param {Object} req - Requête Express.
 * @param {Object} res - Réponse Express.
 * @returns {Object} Objet { count }.
 */
exports.getSuccursaleCount = asyncHandler(async (req, res) => {
  const count = await Succursale.count();
  res.json({ count });
});

/**
 * Génère le prochain code agence (pour formulaire de création).
 * @route GET /succursales/next-code
 * @param {Object} req - Requête Express.
 * @param {Object} res - Réponse Express.
 * @returns {Object} Objet { codeagence }.
 */
exports.getNextCode = asyncHandler(async (req, res) => {
  const maxId = await Succursale.max('idsuccursale') || 0;
  const codeagence = `AG-${String(maxId + 1).padStart(3, '0')}`;
  res.json({ codeagence });
});

/**
 * Récupère la liste des succursales (ID, nom, adresse, ville, code postal) pour les menus déroulants.
 * @route GET /succursales/all-list
 * @param {Object} req - Requête Express.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste simplifiée des succursales.
 */
exports.getSuccursaleNamesList = asyncHandler(async (req, res) => {
  const succursales = await Succursale.findAll({
    attributes: ['idsuccursale', 'nomsuccursale', 'adresse1', 'ville', 'codepostal'],
    order: [['nomsuccursale', 'ASC']]
  });
  res.json(succursales);
});

// --- FONCTIONS POUR LA RECHERCHE DE LIEU STRUCTURÉE ---

/**
 * Récupère la liste unique des pays où il existe des succursales.
 * @route GET /succursales/distinct-countries
 * @param {Object} req - Requête Express.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des pays.
 */
exports.getDistinctCountries = asyncHandler(async (req, res) => {
    const countries = await Succursale.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('pays')), 'country']],
        order: [['pays', 'ASC']], raw: true
    });
    res.json(countries.map(c => c.country));
});

/**
 * Récupère la liste unique des provinces pour un pays donné.
 * @route GET /succursales/distinct-provinces
 * @param {Object} req - Requête Express, query : country.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des provinces.
 */
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

/**
 * Récupère la liste unique des villes pour une combinaison pays/province.
 * @route GET /succursales/distinct-cities
 * @param {Object} req - Requête Express, query : country, province.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des villes.
 */
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

/**
 * Recherche les IDs de succursales correspondant à des critères stricts (pays, province, ville).
 * @route GET /succursales/find-ids
 * @param {Object} req - Requête Express, query : pays, province, ville.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des IDs de succursales.
 */
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

/**
 * Récupère la liste des succursales (ID et nom) pour une ville donnée.
 * @route GET /succursales/by-location
 * @param {Object} req - Requête Express, query : country, province, city.
 * @param {Object} res - Réponse Express.
 * @returns {Array} Liste des succursales pour la localisation donnée.
 */
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
