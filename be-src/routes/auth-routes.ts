import { Router } from "express";
import { createUser, loginUser } from "../controllers/users-controller";

const router = Router();

router.post("/", async (req, res) => {
  if (!req.body || !req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios (name, email, password)." });
  }

  try {
    const newUser = await createUser(req.body);
    res.status(201).json({ newUser });
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Error al crear usuario.",
    });
  }
});

router.post("/token", async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ error: "Debés proporcionar email y contraseña." });
  }

  try {
    const token = await loginUser(req.body.email, req.body.password);
    res.status(200).json({ token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
