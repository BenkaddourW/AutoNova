// Fichier : src/controllers/vehiculeController.js

const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const Vehicule = require("../models/vehicule");
const VehiculeImage = require('../models/vehicule_image');
const sequelize = require('../config/database');
const axios = require("axios");

// Définir l'URL de la Gateway API. Idéalement, cela vient de vos variables d'environnement.
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

// --- Fonctions CRUD ---

exports.getVehicules = asyncHandler(async (req, res) => {
    const { search, marque, categorie, statut, succursaleId, limit = 10, offset = 0 } = req.query;
    let where = {};
    if (search) { where[Op.or] = [ { immatriculation: { [Op.iLike]: `%${search}%` } }, { marque: { [Op.iLike]: `%${search}%` } }, { modele: { [Op.iLike]: `%${search}%` } } ]; }
    if (marque && marque !== 'any') where.marque = { [Op.iLike]: `%${marque}%` };
    if (categorie) where.categorie = { [Op.iLike]: `%${categorie}%` };
    if (statut) where.statut = statut;
    if (succursaleId && succursaleId !== 'any') { where.succursaleidsuccursale = succursaleId; }
    const { count, rows } = await Vehicule.findAndCountAll({ where, limit: Number(limit), offset: Number(offset), order: [['idvehicule', 'ASC']], include: [{ model: VehiculeImage, as: 'VehiculeImages', required: false }], distinct: true });
    res.json({ total: count, vehicules: rows });
});

exports.getVehiculeById = asyncHandler(async (req, res) => {
  const vehicule = await Vehicule.findByPk(req.params.id, { include: [{ model: VehiculeImage, as: 'VehiculeImages' }] });
  if (!vehicule) { res.status(404); throw new Error("Vehicule non trouvé"); }
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

// --- Fonctions de Statistiques ---
exports.getVehiculeCount = asyncHandler(async (req, res) => { 
  const count = await Vehicule.count(); 
  res.json({ count }); 
});

exports.getVehiculeStatsBySuccursale = asyncHandler(async (req, res) => { 
  const stats = await Vehicule.findAll({ 
    attributes: ['succursaleidsuccursale', [Sequelize.fn('COUNT', 'idvehicule'), 'vehiculeCount']], 
    group: ['succursaleidsuccursale'], 
  }); 
  res.json(stats); 
});

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

// --- FONCTION POUR L'ADMINISTRATION ---
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

// --- FONCTION POUR LE SITE PUBLIC ---
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

exports.getVehiculeStatsByMarque = asyncHandler(async (req, res) => { 
  const stats = await Vehicule.findAll({ 
    attributes: ['marque', [Sequelize.fn('COUNT', 'idvehicule'), 'count']], 
    group: ['marque'], 
    order: [[Sequelize.fn('COUNT', 'idvehicule'), 'DESC']], 
    limit: 5, 
  }); 
  res.json(stats); 
});

// --- FONCTION DE RECHERCHE AVEC AGRÉGATION ---
// --- FONCTION POUR OBTENIR UN VÉHICULE PAR ID (AVEC AGRÉGATION) ---
exports.getVehiculeById = asyncHandler(async (req, res) => {
  // 1. On récupère le véhicule depuis notre propre DB
  const vehicle = await Vehicule.findByPk(req.params.id, {
    include: [{ model: VehiculeImage, as: 'VehiculeImages' }]
  });

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicule non trouvé");
  }

  // 2. On fait un appel API via la Gateway pour obtenir les détails de sa succursale
  try {
    const succursaleResponse = await axios.get(`${GATEWAY_URL}/succursales/${vehicle.succursaleidsuccursale}`);
    
    // 3. On "enrichit" l'objet véhicule avec les données reçues
    const vehicleJson = vehicle.toJSON();
    vehicleJson.Succursale = succursaleResponse.data;
    
    res.json(vehicleJson);
  } catch (error) {
    console.error("Erreur d'agrégation pour getVehiculeById:", error.message);
    // En cas d'erreur, on renvoie le véhicule sans les infos de succursale
    res.json(vehicle);
  }
});


// --- FONCTION DE RECHERCHE (AVEC AGRÉGATION) ---
// --- FONCTION DE RECHERCHE PRINCIPALE (AVEC AGRÉGATION) ---
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



// --- OBTENIR LES VÉHICULES EN VEDETTE (AVEC AGRÉGATION) ---
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



