const Taxe = require("./taxe");
const TaxeLocalite = require("./taxe_localite");
 
// Association : une taxe peut s'appliquer à plusieurs localités
Taxe.hasMany(TaxeLocalite, { foreignKey: "idtaxe", as: "localites" });
TaxeLocalite.belongsTo(Taxe, { foreignKey: "idtaxe", as: "taxe" });
 
module.exports = {
  Taxe,
  TaxeLocalite,
};