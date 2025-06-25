const sequelize = require("../config/database");
const Vehicule = require("./vehicule");
const Penalite = require("./penalite");
const VehiculePenalite = require("./vehicule_penalite");

// Déclaration des associations
Vehicule.belongsToMany(Penalite, {
  through: VehiculePenalite,
  foreignKey: "idvehicule",
  otherKey: "idpenalite",
});
Penalite.belongsToMany(Vehicule, {
  through: VehiculePenalite,
  foreignKey: "idpenalite",
  otherKey: "idvehicule",
});

module.exports = {
  sequelize,
  Vehicule,
  Penalite,
  VehiculePenalite,
};
