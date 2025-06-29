const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Taxe = sequelize.define(
  "Taxe",
  {
    idtaxe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    denomination: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [1, 100] },
    },
    abrege: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [1, 50] },
    },
    taux: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
  },
  {
    tableName: "taxe",
    timestamps: false,
  }
);

// Association avec TaxesContrat
Taxe.associate = (models) => {
  Taxe.hasMany(models.TaxesContrat, {
    foreignKey: "idtaxe",
    as: "taxesContrat",
  });
};

module.exports = Taxe;
