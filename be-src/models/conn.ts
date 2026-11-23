import { Sequelize } from "sequelize";

import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Falta configurar la variable DATABASE_URL en el archivo .env",
  );
}

// Inicializamos Sequelize pasándole la URL validada
export const sequelizeInstance = new Sequelize(databaseUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon requiere esto para conexiones externas seguras
    },
  },
  logging: false, // Ponelo en true si querés ver las queries de SQL en la consola
});

(async () => {
  try {
    await sequelizeInstance.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
