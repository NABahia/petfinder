import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getUser, updateUser } from "../controllers/users-controller";
import { getUserPets } from "../controllers/pets-controller";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userData = await getUser(req.user!.id);
    if (!userData) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json(userData);
  } catch (error) {
    console.error("Error en GET /user/me:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, fullname, password } = req.body || {};

    const updatedUser = await updateUser(req.user!.id, {
      name: name ?? fullname,
      password,
    });

    res.json({
      message: "Datos actualizados correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Error al actualizar usuario." });
  }
});

router.get("/me/pets", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const misMascotas = await getUserPets(req.user!.id);
    res.json(misMascotas);
  } catch (error) {
    console.error("Error en GET /user/me/pets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
