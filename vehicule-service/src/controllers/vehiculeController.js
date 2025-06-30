/**
 * Contrôleur Véhicule
 * -------------------
 * Gère toutes les opérations liées aux véhicules : CRUD, recherche, statistiques, agrégation avec images et succursales.
 * 
 * Dépendances :
 * - Modèles Sequelize (Vehicule, VehiculeImage)
 * - Axios pour les appels inter-services (succursales, réservations)
 * 
 * Toutes les fonctions sont asynchrones et utilisent express-async-handler pour la gestion des erreurs.
 */

// Fichier : src/controllers/vehiculeController.js

const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const Vehicule = require("../models/vehicule");
const VehiculeImage = require('../models/vehicule_image');
const sequelize = require('../config/database');
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

/**
 * Liste les véhicules avec filtres, pagination et images associées.
 * @route GET /vehicules
 * @query {string} search - Recherche globale (immatriculation, marque, modèle)
 * @query {string} marque - Filtre par marque
 * @query {string} categorie - Filtre par catégorie
 * @query {string} statut - Filtre par statut
 * @query {string} succursaleId - Filtre par succursale
 * @query {number} limit - Nombre de résultats par page (déprécié, utiliser pageSize)
 * @query {number} offset - Décalage pour la pagination (déprécié, utiliser page)
 * @query {number} page - Numéro de page (commence à 1)
 * @query {number} pageSize - Nombre de résultats par page
 * @returns {Object} { total, vehicules }
 */
exports.getVehicules = asyncHandler(async (req, res) => {
    const { search, marque, categorie, statut, succursaleId, limit, offset, page, pageSize = 10 } = req.query;
    
    // Calcul de la pagination
    let finalLimit = pageSize;
    let finalOffset = 0;
    
    if (page && pageSize) {
        // Nouvelle pagination avec page/pageSize
        finalLimit = Number(pageSize);
        finalOffset = (Number(page) - 1) * Number(pageSize);
    } else if (limit && offset) {
        // Ancienne pagination avec limit/offset (rétrocompatibilité)
        finalLimit = Number(limit);
        finalOffset = Number(offset);
    } else if (limit) {
        // Fallback avec seulement limit
        finalLimit = Number(limit);
    }
    
    let where = {};
    if (search) { where[Op.or] = [ { immatriculation: { [Op.iLike]: `%${search}%` } }, { marque: { [Op.iLike]: `%${search}%` } }, { modele: { [Op.iLike]: `%${search}%` } } ]; }
    if (marque && marque !== 'any') where.marque = { [Op.iLike]: `%${marque}%` };
    if (categorie) where.categorie = { [Op.iLike]: `%${categorie}%` };
    if (statut) where.statut = statut;
    if (succursaleId && succursaleId !== 'any') { where.succursaleidsuccursale = succursaleId; }
    
    const { count, rows } = await Vehicule.findAndCountAll({ 
        where, 
        limit: finalLimit, 
        offset: finalOffset, 
        order: [['idvehicule', 'ASC']], 
        include: [{ model: VehiculeImage, as: 'VehiculeImages', required: false }], 
        distinct: true 
    });
    
    res.json({ total: count, vehicules: rows });
});

/**
 * Récupère un véhicule par son ID, avec images associées.
 * @route GET /vehicules/:id
 * @param {number} id - ID du véhicule
 * @returns {Object} Véhicule trouvé ou 404
 */
exports.getVehiculeById = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id, { include: [{ model: VehiculeImage, as: 'VehiculeImages' }] });
  if (!vehicule) { res.status(404); throw new Error("Vehicule non trouvé"); }
  res.json(vehicule);
});

/**
 * Crée un nouveau véhicule et ses images.
 * @route POST /vehicules
 * @body {Object} vehiculeData - Données du véhicule
 * @body {Array} images - URLs des images
 * @returns {Object} Véhicule créé
 * @throws {400} Erreur de validation
 */
exports.createVehicule = asyncHandler(async (req, res) => {
    const { images, ...vehiculeData } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const newVehicule = await Vehicule.create(vehiculeData, { transaction });
        if (images && images.length > 0) {
            const imageRecords = images.map((urlImage, index) => ({
               urlimage: urlImage,
                estprincipale: index === 0,
                idvehicule: newVehicule.idvehicule
            }));
            await VehiculeImage.bulkCreate(imageRecords, { transaction });
        }
        await transaction.commit();
        const result = await Vehicule.findByPk(newVehicule.idvehicule, { include: [{ model: VehiculeImage, as: 'VehiculeImages' }] });
        res.status(201).json(result);
    } catch (error) {
        await transaction.rollback();
        const errors = error.errors ? error.errors.map(e => ({ field: e.path, message: e.message })) : [];
        res.status(400).json({ message: error.message, errors });
    }
});

/**
 * Met à jour un véhicule existant et ses images.
 * @route PUT /vehicules/:id
 * @param {number} id - ID du véhicule
 * @body {Object} vehiculeData - Données à mettre à jour
 * @body {Array} images - URLs des images
 * @returns {Object} Véhicule mis à jour
 * @throws {404} Véhicule non trouvé
 */
exports.updateVehicule = asyncHandler(async (req, res) => {
    const { images, ...vehiculeData } = req.body;
    const { id } = req.params;
    const transaction = await sequelize.transaction();
    try {
        const vehicule = await Vehicule.findByPk(id);
        if (!vehicule) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        await vehicule.update(vehiculeData, { transaction });

        if (typeof images !== 'undefined') {
            await VehiculeImage.destroy({ where: { idvehicule: id }, transaction });
            if (images && images.length > 0) {
                const imageRecords = images.map((urlImage, index) => ({
                    urlimage: urlImage,
                    estprincipale: index === 0,
                    idvehicule: id
                }));
                await VehiculeImage.bulkCreate(imageRecords, { transaction });
            }
        }
        await transaction.commit();
        const result = await Vehicule.findByPk(id, { include: [{ model: VehiculeImage, as: 'VehiculeImages' }] });
        res.status(200).json(result);
    } catch (error) {
        await transaction.rollback();
        const errors = error.errors ? error.errors.map(e => ({ field: e.path, message: e.message })) : [];
        res.status(400).json({ message: error.message, errors });
    }
});

/**
 * Retourne le nombre total de véhicules.
 * @route GET /vehicules/count
 * @returns {Object} { count }
 */
exports.getVehiculeCount = asyncHandler(async (req, res) => { 
  const count = await Vehicule.count(); 
  res.json({ count }); 
});

/**
 * Statistiques de véhicules par succursale.
 * @route GET /vehicules/stats/by-succursale
 * @returns {Array} Statistiques groupées par succursale
 */
exports.getVehiculeStatsBySuccursale = asyncHandler(async (req, res) => { 
  const stats = await Vehicule.findAll({ 
    attributes: ['succursaleidsuccursale', [Sequelize.fn('COUNT', 'idvehicule'), 'vehiculeCount']], 
    group: ['succursaleidsuccursale'], 
  }); 
  res.json(stats); 
});

/**
 * Statistiques générales sur les véhicules (total, disponibles, etc.).
 * @route GET /vehicules/stats/general
 * @returns {Object} Statistiques globales
 */
exports.getVehiculeGeneralStats = asyncHandler(async (req, res) => { 
  const [total, disponibles, en_location, en_maintenance, hors_service] = await Promise.all([ 
    Vehicule.count(), 
    Vehicule.count({ where: { statut: 'disponible' } }), 
    Vehicule.count({ where: { statut: 'en_location' } }), 
    Vehicule.count({ where: { statut: 'en_maintenance' } }), 
    Vehicule.count({ where: { statut: 'hors_service' } }) 
  ]); 
  res.json({ total, disponibles, en_location, en_maintenance, hors_service }); 
});

/**
 * Retourne les options de filtres pour l'administration.
 * @route GET /vehicules/filter-options
 * @returns {Object} Listes distinctes pour chaque filtre
 */
exports.getVehiculeFilterOptions = asyncHandler(async (req, res) => { 
  const [marques, categories, energies, transmissions] = await Promise.all([ 
    Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('marque')), 'marque']], raw: true, order: ['marque'] }), 
    Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('categorie')), 'categorie']], raw: true, order: ['categorie'] }), 
    Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('energie')), 'energie']], raw: true, order: ['energie'] }), 
    Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('transmission')), 'transmission']], raw: true, order: ['transmission'] }), 
  ]); 
  res.json({ 
    marques: marques.map(item => item.marque), 
    categories: categories.map(item => item.categorie), 
    energies: energies.map(item => item.energie), 
    transmissions: transmissions.map(item => item.transmission), 
  }); 
});

/**
 * Retourne les options de filtres pour le site public.
 * @route GET /vehicules/public-filter-options
 * @returns {Object} Listes distinctes pour chaque filtre public
 */
exports.getPublicFilterOptions = asyncHandler(async (req, res) => {
    const [marques, categories, energies, transmissions, sieges, typesentrainement] = await Promise.all([ 
        Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('marque')), 'marque']], raw: true, order: [['marque', 'ASC']] }), 
        Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('categorie')), 'categorie']], raw: true, order: [['categorie', 'ASC']] }), 
        Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('energie')), 'energie']], raw: true, order: [['energie', 'ASC']] }), 
        Vehicule.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('transmission')), 'transmission']], raw: true, order: [['transmission', 'ASC']] }),
        Vehicule.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('sieges')), 'sieges']],
            raw: true,
            where: { sieges: { [Op.ne]: null } },
            order: [[Sequelize.col('sieges'), 'ASC']]
        }),
        Vehicule.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('typeentrainement')), 'typeentrainement']],
            raw: true,
            where: { typeentrainement: { [Op.ne]: null } },
            order: [[Sequelize.col('typeentrainement'), 'ASC']]
        })
    ]); 
    
    res.json({ 
        marques: marques.map(item => item.marque), 
        categories: categories.map(item => item.categorie), 
        energies: energies.map(item => item.energie), 
        transmissions: transmissions.map(item => item.transmission),
        sieges: sieges.map(item => item.sieges),
        typesEntrainement: typesentrainement.map(item => item.typeentrainement)
    }); 
});

/**
 * Statistiques de véhicules par marque (top 5).
 * @route GET /vehicules/stats/by-marque
 * @returns {Array} Statistiques groupées par marque
 */
exports.getVehiculeStatsByMarque = asyncHandler(async (req, res) => { 
  const stats = await Vehicule.findAll({ 
    attributes: ['marque', [Sequelize.fn('COUNT', 'idvehicule'), 'count']], 
    group: ['marque'], 
    order: [[Sequelize.fn('COUNT', 'idvehicule'), 'DESC']], 
    limit: 5, 
  }); 
  res.json(stats); 
});

/**
 * Recherche de véhicules disponibles avec agrégation (images, succursales).
 * @route GET /vehicules/search
 * @query {string} marque, categorie, transmission, etc.
 * @query {string} datedebut, datefin - Période de location
 * @returns {Object} { vehicles, total }
 */
exports.searchAvailableVehicles = asyncHandler(async (req, res) => {
    const { 
        idsuccursale, pays, province, ville: queryVille, location, marque, datedebut, datefin,
        categories, transmission, energie, typeEntrainement, sieges, prixMax,
        limit = 9, offset = 0
    } = req.query;

    const cityToSearch = queryVille || location;
    let succursaleIdsToFilter = [];

    // 1. Déterminer les ID de succursales
    if (idsuccursale) {
        succursaleIdsToFilter.push(idsuccursale);
    } else if (pays || province || cityToSearch) {
        try {
            const response = await axios.get(`${GATEWAY_URL}/succursales/find-ids`, { params: { pays, province, ville: cityToSearch } });
            succursaleIdsToFilter = response.data;
            if (succursaleIdsToFilter.length === 0) return res.json({ vehicles: [], total: 0 });
        } catch (error) {
            console.error("Erreur d'appel au service de succursales:", error.message);
            return res.status(502).json({ message: "Le service de succursales est indisponible." });
        }
    }

    // 2. Construire la clause WHERE
    const vehicleWhereClause = {};
    
    // Filtres principaux
    if (marque && marque !== 'any') vehicleWhereClause.marque = { [Op.iLike]: marque };
    if (succursaleIdsToFilter.length > 0) {
        vehicleWhereClause.succursaleidsuccursale = { [Op.in]: succursaleIdsToFilter };
    } else if (pays || province || cityToSearch) {
        return res.json({ vehicles: [], total: 0 });
    }

    // ✅ CORRECTION FINALE : Utilisation de [Op.iLike] pour ignorer la casse
    // Filtres d'affinage
    if (categories) {
      // Pour les catégories (checkboxes), Op.in est ok car les valeurs sont contrôlées.
      vehicleWhereClause.categorie = { [Op.in]: categories.split(',') };
    }
    if (transmission && transmission !== 'any') {
      // On rend la recherche insensible à la casse pour plus de robustesse
      vehicleWhereClause.transmission = { [Op.iLike]: transmission };
    }
    if (energie && energie !== 'any') {
      vehicleWhereClause.energie = { [Op.iLike]: energie };
    }
    if (typeEntrainement && typeEntrainement !== 'any') {
      // Le nom de la colonne est bien 'typeentrainement'
      vehicleWhereClause.typeentrainement = { [Op.iLike]: typeEntrainement };
    }
    
    // Pour les nombres, on garde l'égalité stricte
    if (sieges && sieges !== 'any') {
      vehicleWhereClause.sieges = Number(sieges);
    }
    if (prixMax) {
      vehicleWhereClause.tarifjournalier = { [Op.lte]: Number(prixMax) };
    }

    // 3. Trouver les véhicules
    const potentialVehicles = await Vehicule.findAll({
        where: vehicleWhereClause,
        include: [{ model: VehiculeImage, as: 'VehiculeImages' }]
    });

    if (potentialVehicles.length === 0) {
        return res.json({ vehicles: [], total: 0 });
    }

    // 4. Vérifier la disponibilité
    let availableVehicles = potentialVehicles;
    if (datedebut && datefin) {
        try {
            const vehicleIds = potentialVehicles.map(v => v.idvehicule);
            const response = await axios.post(`${GATEWAY_URL}/reservations/disponibilites`, {
                idsvehicules: vehicleIds, datedebut, datefin
            });
            const availableVehicleIds = new Set(response.data.disponibles);
            availableVehicles = potentialVehicles.filter(v => availableVehicleIds.has(v.idvehicule));
        } catch (error) {
            console.error("Erreur d'appel au service de réservations:", error.message);
            return res.status(502).json({ message: "Le service de réservations est indisponible." });
        }
    }
    
    // 5. Enrichir avec les données des succursales
    let enrichedVehicles = [];
    if (availableVehicles.length > 0) {
        try {
            const allSuccursaleIds = [...new Set(availableVehicles.map(v => v.succursaleidsuccursale))];
            const succursalesResponse = await axios.get(`${GATEWAY_URL}/succursales`, {
                params: { ids: allSuccursaleIds.join(',') }
            });
            const succursaleMap = new Map(succursalesResponse.data.map(s => [s.idsuccursale, s]));
            enrichedVehicles = availableVehicles.map(vehicle => {
                const vehicleJson = vehicle.toJSON();
                vehicleJson.Succursale = succursaleMap.get(vehicle.succursaleidsuccursale) || null;
                return vehicleJson;
            });
        } catch (error) {
            console.error("Erreur d'agrégation des succursales:", error.message);
            enrichedVehicles = availableVehicles.map(v => v.toJSON());
        }
    }

    // 6. Pagination et envoi de la réponse
    const total = enrichedVehicles.length;
    const paginatedVehicles = enrichedVehicles.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
        vehicles: paginatedVehicles,
        total: total
    });
});



/**
 * Récupère les véhicules en vedette (populaires), enrichis avec images et succursales.
 * @route GET /vehicules/featured
 * @returns {Array} Liste des véhicules en vedette
 */
exports.getFeaturedVehicles = asyncHandler(async (req, res) => {
  try {
    const topIdsResponse = await axios.get(`${GATEWAY_URL}/reservations/stats/top-ids?limit=3`);
    const topVehicleIds = topIdsResponse.data;

    if (!topVehicleIds || topVehicleIds.length === 0) {
      return res.json([]); // Renvoie un tableau vide si aucun véhicule populaire
    }

    const featuredVehicles = await Vehicule.findAll({
      where: { idvehicule: { [Op.in]: topVehicleIds } },
      include: [{ model: VehiculeImage, as: 'VehiculeImages' }]
    });
    
    // On agrège les infos de succursale pour ces véhicules
    const allSuccursaleIds = [...new Set(featuredVehicles.map(v => v.succursaleidsuccursale))];
    const succursalesResponse = await axios.get(`${GATEWAY_URL}/succursales`, {
        params: { ids: allSuccursaleIds.join(',') }
    });
    const succursaleMap = new Map(succursalesResponse.data.map(s => [s.idsuccursale, s]));
    
    const enrichedVehicles = featuredVehicles.map(vehicle => {
        const vehicleJson = vehicle.toJSON();
        vehicleJson.Succursale = succursaleMap.get(vehicle.succursaleidsuccursale) || null;
        return vehicleJson;
    });

    const sortedEnrichedVehicles = topVehicleIds.map(id => 
      enrichedVehicles.find(v => v.idvehicule === id)
    ).filter(Boolean);

    res.json(sortedEnrichedVehicles);

  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules en vedette:", error.message);
    res.status(500).json({ message: "Impossible de récupérer les véhicules en vedette." });
  }
});


/**
 * Recherche des véhicules disponibles selon plusieurs critères.
 * Cette fonction interroge le service Réservation pour vérifier la disponibilité réelle des véhicules.
 * 
 * Étapes :
 * 1. Construction de la requête de filtrage selon les critères reçus (succursale, modèle, marque, catégorie).
 * 2. Récupération des véhicules correspondants en base, incluant leur image principale.
 * 3. Extraction des identifiants des véhicules trouvés.
 * 4. Appel au service Réservation pour obtenir la liste des véhicules réellement disponibles aux dates demandées.
 * 5. Filtrage de la liste initiale pour ne conserver que les véhicules confirmés comme disponibles.
 * 6. Formatage de la réponse pour le front-end, en ajoutant la photo principale si disponible.
 * 
 * @route GET /vehicules/disponibles
 * @query {number} idsuccursale - Identifiant de la succursale (optionnel)
 * @query {string} datedebut - Date de début de la période de location
 * @query {string} datefin - Date de fin de la période de location
 * @query {string} modele - Modèle du véhicule (optionnel)
 * @query {string} marque - Marque du véhicule (optionnel)
 * @query {string} categorie - Catégorie du véhicule (optionnel)
 * @returns {Array} Liste des véhicules disponibles, chacun enrichi de sa photo principale si existante
 */
exports.getVehiculesDisponibles = asyncHandler(async (req, res) => {
  try {
    const { idsuccursale, datedebut, datefin, modele, marque, categorie } = req.query;

    // 1. Construction du filtre pour la recherche en base (statut "disponible" obligatoire)
    const where = {
      statut: "disponible"
    };
    if (idsuccursale) where.succursaleidsuccursale = idsuccursale;
    if (modele) where.modele = modele;
    if (marque) where.marque = marque;
    if (categorie) where.categorie = categorie;

    // 2. Récupération des véhicules correspondant aux critères, avec leur image principale
    const vehiculesPotentiels = await Vehicule.findAll({
      where,
      include: [
        {
          model: VehiculeImage,
          as: "VehiculeImages", // L'alias doit correspondre à celui défini dans l'association des modèles
          where: { estprincipale: true },
          required: false, // LEFT JOIN pour inclure les véhicules sans image principale
        },
      ],
    });

    // Si aucun véhicule ne correspond aux critères, retourner un tableau vide
    if (!vehiculesPotentiels.length) {
      return res.json([]);
    }

    // 3. Extraction des identifiants des véhicules trouvés
    const idsvehicules = vehiculesPotentiels.map((v) => v.idvehicule);

    // 4. Appel au service Réservation pour vérifier la disponibilité réelle sur la période demandée
    const response = await axios.post(
      "http://localhost:3000/reservations/disponibilites", // À adapter si l'URL du service change
      { idsvehicules, datedebut, datefin }
    );

    const idsDisponibles = response.data.disponibles;

    // 5. Filtrage pour ne conserver que les véhicules confirmés comme disponibles
    const vehiculesDisponibles = vehiculesPotentiels
      .filter((v) => idsDisponibles.includes(v.idvehicule))
      .map((v) => {
        // Formatage de la réponse pour le front-end, ajout de la photo principale si existante
        const vehiculeJson = v.toJSON();
        return {
          ...vehiculeJson,
          photoPrincipale:
            vehiculeJson.VehiculeImages && vehiculeJson.VehiculeImages.length > 0
              ? vehiculeJson.VehiculeImages[0].urlimage
              : null, // Valeur nulle si aucune image n'est disponible
        }
      });

    res.json(vehiculesDisponibles);

  } catch (err) {
    console.error("Erreur dans getVehiculesDisponibles:", err);
    res.status(500).json({
      message: "Erreur lors de la recherche des véhicules disponibles.",
      error: err.message,
    });
  }
});

