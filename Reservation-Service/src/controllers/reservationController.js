const Vehicule = require("../models/vehicule");
const { Op } = require("sequelize");

// Obtenir tous les vehicules
exports.getVehicules = async (req, res) => {
  try {
    const vehicules = await Vehicule.findAll();
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir un vehicule par ID
exports.getVehiculeById = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ message: "Vehicule non trouve" });
    }
    res.json(vehicule);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Creer un vehicule
exports.createVehicule = async (req, res) => {
  try {
    const nouveauVehicule = await Vehicule.create(req.body);
    res.status(201).json(nouveauVehicule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Mettre a jour un vehicule
exports.updateVehicule = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ message: "Vehicule non trouve" });
    }
    await vehicule.update(req.body);
    res.json(vehicule);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer un vehicule
exports.deleteVehicule = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ message: "Vehicule non trouve" });
    }
    await vehicule.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Erreur serveur", error: error.message });

  }
};

// filtre par marque, catégorie, statut
exports.getVehicules = async (req, res) => {
  try {
    // Récupère les paramètres de filtre de la requête
    const { marque, categorie, statut } = req.query;

    // Construis la condition WHERE dynamiquement
    const where = {};
    if (marque) where.marque = marque;
    if (categorie) where.categorie = categorie;
    if (statut) where.statut = statut;

    const vehicules = await Vehicule.findAll({ where });
    res.json(vehicules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// tous les types de filtres



// GET /api/vehicules?marque=...&categorie=...&statut=...&kilometrageMin=...&kilometrageMax=...&tarifjournalierMin=...&tarifjournalierMax=...&energie=...&transmission=...&siegesMin=...&siegesMax=...&succursaleidsuccursale=...
exports.getVehicules = async (req, res) => {
  try {
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
      succursaleidsuccursale
    } = req.query;

    const where = {};

    if (marque) where.marque = { [Op.iLike]: `%${marque}%` }; // recherche partielle, insensible à la casse
    if (categorie) where.categorie = { [Op.iLike]: `%${categorie}%` };
    if (statut) where.statut = statut;
    if (energie) where.energie = energie;
    if (transmission) where.transmission = transmission;
    if (succursaleidsuccursale) where.succursaleidsuccursale = succursaleidsuccursale;

    if (kilometrageMin) where.kilometrage = { [Op.gte]: Number(kilometrageMin) };
    if (kilometrageMax) {
      where.kilometrage = {
        ...(where.kilometrage || {}),
        [Op.lte]: Number(kilometrageMax)
      };
    }

    if (tarifjournalierMin) where.tarifjournalier = { [Op.gte]: Number(tarifjournalierMin) };
    if (tarifjournalierMax) {
      where.tarifjournalier = {
        ...(where.tarifjournalier || {}),
        [Op.lte]: Number(tarifjournalierMax)
      };
    }

    if (siegesMin) where.sieges = { [Op.gte]: Number(siegesMin) };
    if (siegesMax) {
      where.sieges = {
        ...(where.sieges || {}),
        [Op.lte]: Number(siegesMax)
      };
    }

    const vehicules = await Vehicule.findAll({ where });
    res.json(vehicules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// pagination
const { limit = 10, offset = 0 } = req.query;
const vehicules = await Vehicule.findAll({ where, limit: Number(limit), offset: Number(offset) });

