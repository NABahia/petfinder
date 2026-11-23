import { DataTypes } from "sequelize";
import { sequelizeInstance } from "./conn";

export const Pet = sequelizeInstance.define("pet", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "lost", // Opciones: 'lost' o 'found'
  },
  location: {
    type: DataTypes.STRING, // Ej: "Palermo, CABA" para mostrar en la UI
    allowNull: false,
  },
  lat: {
    type: DataTypes.FLOAT, // Obligatorio para Algolia
    allowNull: false,
  },
  lng: {
    type: DataTypes.FLOAT, // Obligatorio para Algolia
    allowNull: false,
  },
  petImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
