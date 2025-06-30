const Utilisateur = require("./utilisateur");
const Role = require("./role");
const Employe = require("./employe");
const UtilisateurRole = require("./utilisateur_role");

// Associations
Utilisateur.belongsToMany(Role, {
  through: UtilisateurRole,
  as: "Roles",
  foreignKey: "idutilisateur", // clé étrangère dans utilisateur_role vers Utilisateur
  otherKey: "idrole", // clé étrangère dans utilisateur_role vers Role
});
Role.belongsToMany(Utilisateur, {
  through: UtilisateurRole,
  as: "Utilisateurs",
  foreignKey: "idrole", // clé étrangère dans utilisateur_role vers Role
  otherKey: "idutilisateur", // clé étrangère dans utilisateur_role vers Utilisateur
});
Utilisateur.hasMany(Employe, { as: "Employes", foreignKey: "idutilisateur" });
Employe.belongsTo(Utilisateur, { foreignKey: "idutilisateur" });

module.exports = {
  Utilisateur,
  Role,
  Employe,
  UtilisateurRole,
};
