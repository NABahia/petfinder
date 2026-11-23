import { sequelizeInstance } from "./models/conn";

import "./models/user";
import "./models/pet";
import "./models/report";
import "./models/";

sequelizeInstance
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Error al sincronizar la base de datos:", error);
  });
