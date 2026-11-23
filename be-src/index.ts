import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth-routes";
import usersRoutes from "./routes/users-routes";
import petsRoutes from "./routes/pets-routes";

if (!process.env.JWT_SECRET) {
  throw new Error("Falta configurar JWT_SECRET en las variables de entorno.");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Rutas de la API
app.use("/auth", authRoutes);
app.use("/user", usersRoutes);
app.use("/pets", petsRoutes);

// Archivos estáticos del frontend
const staticPath = path.resolve(__dirname, "../fe-dist");
app.use(express.static(staticPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
