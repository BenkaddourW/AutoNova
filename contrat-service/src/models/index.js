const sequelize = require("../config/database");
const Contrat = require("./contrat");
const ContratPenalite = require("./contrat_penalite");
const Inspection = require("./inspection");

// Associations (optionnelles, utiles pour les méthodes Sequelize)
Contrat.hasMany(ContratPenalite, {
  foreignKey: "idcontrat",
  as: "penalites",
});
ContratPenalite.belongsTo(Contrat, {
  foreignKey: "idcontrat",
  as: "contrat",
});

// Associations pour Inspection (optionnel mais recommandé)
Contrat.hasMany(Inspection, {
  foreignKey: "idcontrat",
  as: "inspections",
});
Inspection.belongsTo(Contrat, {
  foreignKey: "idcontrat",
  as: "contrat",
});

module.exports = {
  sequelize,
  Contrat,
  ContratPenalite,
  Inspection,
};
