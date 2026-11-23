// Importamos las clases de las tablas de la base de datos
import { User } from "./user";
import { Pet } from "./pet";
import { Report } from "./report";

// Un usuario puede tener muchas mascotas reportadas
User.hasMany(Pet);
Pet.belongsTo(User);

// Una mascota puede tener muchos reportes de avistamiento
Pet.hasMany(Report);
Report.belongsTo(Pet);

export { User, Pet, Report };
