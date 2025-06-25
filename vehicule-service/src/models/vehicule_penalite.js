const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehiculePenalite = sequelize.define(
  "VehiculePenalite",
  {
    idvehicule: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "vehicule",
        key: "idvehicule",
      },
    },
    idpenalite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "penalite",
        key: "idpenalite",
      },
    },
    montantbase: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: "vehicule_penalite",
    timestamps: false,
  }
);

module.exports = VehiculePenalite;
