import { DataTypes } from "sequelize";
import { sequelizeInstance } from "./conn";

export const Report = sequelizeInstance.define("report", {
  reporterName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reporterPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pictureUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
