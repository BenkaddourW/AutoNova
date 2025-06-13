const Vehicule = require("../models/vehicule");

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