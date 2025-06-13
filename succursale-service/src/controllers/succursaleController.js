const Succursale = require("../models/succursale");
const { Op } = require("sequelize");

exports.getSuccursales = async (req, res) => {
  try {
    const succursales = await Succursale.findAll();
    res.json(succursales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getSuccursaleById = async (req, res) => {
  try {
    const succursale = await Succursale.findByPk(req.params.id);
    if (!succursale) {
      return res.status(404).json({ message: "Succursale non trouvée" });
    }
    res.json(succursale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.createSuccursale = async (req, res) => {
  try {
    const nouvelleSuccursale = await Succursale.create(req.body);
    res.status(201).json(nouvelleSuccursale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByPk(req.params.id);
    if (!succursale) {
      return res.status(404).json({ message: "Succursale non trouvée" });
    }
    await succursale.update(req.body);
    res.json(succursale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByPk(req.params.id);
    if (!succursale) {
      return res.status(404).json({ message: "Succursale non trouvée" });
    }
    await succursale.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// GET /api/succursales?ville=...&province=...&pays=...&nomsuccursale=...&codeagence=...
exports.getSuccursales = async (req, res) => {
  try {
    const {
      ville,
      province,
      pays,
      nomsuccursale,
      codeagence,
      codepostal
    } = req.query;

    const where = {};

    if (ville) where.ville = { [Op.iLike]: `%${ville}%` };
    if (province) where.province = province;
    if (pays) where.pays = pays;
    if (nomsuccursale) where.nomsuccursale = { [Op.iLike]: `%${nomsuccursale}%` };
    if (codeagence) where.codeagence = { [Op.iLike]: `%${codeagence}%` };
    if (codepostal) where.codepostal = codepostal;

    const succursales = await Succursale.findAll({ where });
    res.json(succursales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Pagination
const { limit = 10, offset = 0 } = req.query;
const succursales = await Succursale.findAll({
  where,
  limit: Number(limit),
  offset: Number(offset)
});
