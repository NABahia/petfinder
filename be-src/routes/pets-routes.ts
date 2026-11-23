import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import {
  getAllPets,
  createPet,
  searchNearbyPets,
  getPetById,
  updatePet,
  deletePet,
} from "../controllers/pets-controller";
import { createReport } from "../controllers/report-controller";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const newPet = await createPet(req.user!.id, req.body || {});
    res.status(201).json({ newPet });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const pets = await getAllPets();
    res.json(pets);
  } catch (error) {
    console.error("Error en GET /pets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/cerca", async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Faltan las coordenadas (lat y lng) en la URL." });
  }

  const latNumber = parseFloat(lat as string);
  const lngNumber = parseFloat(lng as string);
  const radiusNumber = radius ? parseInt(radius as string, 10) : 5000;

  if (Number.isNaN(latNumber) || Number.isNaN(lngNumber)) {
    return res
      .status(400)
      .json({ error: "Las coordenadas (lat y lng) deben ser numéricas." });
  }

  try {
    const petsNearby = await searchNearbyPets(
      latNumber,
      lngNumber,
      Number.isNaN(radiusNumber) ? 5000 : radiusNumber,
    );

    res.status(200).json({
      resultados: petsNearby.length,
      mascotas: petsNearby,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const petId = Number(req.params.id);
  if (Number.isNaN(petId)) {
    return res.status(400).json({ error: "ID de mascota inválido." });
  }

  try {
    const pet = await getPetById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Mascota no encontrada." });
    }
    res.json(pet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const petId = Number(req.params.id);
  if (Number.isNaN(petId)) {
    return res.status(400).json({ error: "ID de mascota inválido." });
  }

  try {
    const updated = await updatePet(petId, req.user!.id, req.body || {});
    res.json({ message: "Mascota actualizada correctamente", pet: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const petId = Number(req.params.id);
  if (Number.isNaN(petId)) {
    return res.status(400).json({ error: "ID de mascota inválido." });
  }

  try {
    await deletePet(petId, req.user!.id);
    res.json({ ok: true, message: "Mascota eliminada correctamente" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/report", async (req, res) => {
  const petId = Number(req.params.id);
  if (Number.isNaN(petId)) {
    return res.status(400).json({ error: "ID de mascota inválido." });
  }

  try {
    const result = await createReport(petId, req.body || {});
    res.status(201).json({
      ok: true,
      report: result.report,
      emailSent: result.emailSent,
    });
  } catch (error: any) {
    console.error("Error en el endpoint de reportes:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
