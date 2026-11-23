import { Pet } from "../models";
import { uploadImageToCloudinary } from "../lib/cloudinary";
import { algoliaClient, algoliaIndex } from "../lib/algolia";

export async function getAllPets() {
  return await Pet.findAll();
}

export async function createPet(
  userId: number,
  petData: {
    name: string;
    location: string;
    lat: number;
    lng: number;
    pictureData?: string;
  },
) {
  const name = petData.name?.trim();
  const location = petData.location?.trim();
  const lat = Number(petData.lat);
  const lng = Number(petData.lng);

  if (!name || !location || Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error(
      "Faltan datos obligatorios o válidos (name, location, lat, lng).",
    );
  }

  let secureUrl = "";

  if (petData.pictureData) {
    secureUrl = await uploadImageToCloudinary(petData.pictureData);
  }

  const newPet = await Pet.create({
    name,
    location,
    lat,
    lng,
    userId,
    petImageUrl: secureUrl,
  });

  const algoliaObject = {
    objectID: String(newPet.getDataValue("id")),
    name,
    location,
    petImageUrl: secureUrl,
    _geoloc: {
      lat,
      lng,
    },
  };

  try {
    await algoliaClient.saveObject({
      indexName: algoliaIndex,
      body: algoliaObject,
    });
  } catch (error) {
    console.error("Error al guardar en Algolia:", error);
    await newPet.destroy();
    throw new Error("Falló la sincronización geoespacial.");
  }

  return newPet;
}

export async function getUserPets(userId: number) {
  return await Pet.findAll({
    where: {
      userId,
    },
    order: [["createdAt", "DESC"]],
  });
}

export async function getPetById(id: number) {
  return await Pet.findByPk(id);
}

export async function searchNearbyPets(
  lat: number,
  lng: number,
  radiusInMeters = 5000,
) {
  try {
    const searchResults = await algoliaClient.searchSingleIndex({
      indexName: algoliaIndex,
      searchParams: {
        aroundLatLng: `${lat},${lng}`,
        aroundRadius: radiusInMeters,
      },
    });

    return searchResults.hits;
  } catch (error) {
    console.error("Error al buscar en Algolia:", error);
    throw new Error("Falló la búsqueda de mascotas cercanas.");
  }
}

export async function updatePet(
  id: number,
  userId: number,
  petData: {
    name?: string;
    location?: string;
    lat?: number;
    lng?: number;
    pictureData?: string;
    status?: string;
  },
) {
  const originalPetData = await Pet.findOne({
    where: { id, userId },
  });

  if (!originalPetData) {
    throw new Error("Mascota no encontrada o no tenés permiso para editarla.");
  }

  if (petData.status && !["lost", "found"].includes(petData.status)) {
    throw new Error("El estado debe ser 'lost' o 'found'.");
  }

  const parsedLat =
    petData.lat !== undefined
      ? Number(petData.lat)
      : Number(originalPetData.getDataValue("lat"));
  const parsedLng =
    petData.lng !== undefined
      ? Number(petData.lng)
      : Number(originalPetData.getDataValue("lng"));

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    throw new Error("Las coordenadas lat y lng deben ser numéricas.");
  }

  let secureUrl = originalPetData.getDataValue("petImageUrl") || "";

  if (petData.pictureData && petData.pictureData.startsWith("data:image")) {
    secureUrl = await uploadImageToCloudinary(petData.pictureData);
  }

  const updatedFields = {
    name: petData.name?.trim() || originalPetData.getDataValue("name"),
    location:
      petData.location?.trim() || originalPetData.getDataValue("location"),
    lat: parsedLat,
    lng: parsedLng,
    status: petData.status ?? originalPetData.getDataValue("status"),
    petImageUrl: secureUrl,
  };

  await originalPetData.update(updatedFields);

  try {
    if (updatedFields.status === "found") {
      await algoliaClient.deleteObject({
        indexName: algoliaIndex,
        objectID: String(id),
      });
    } else {
      await algoliaClient.saveObject({
        indexName: algoliaIndex,
        body: {
          objectID: String(id),
          name: updatedFields.name,
          location: updatedFields.location,
          petImageUrl: updatedFields.petImageUrl,
          _geoloc: {
            lat: updatedFields.lat,
            lng: updatedFields.lng,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error al sincronizar cambios con Algolia:", error);
  }

  return originalPetData;
}

export async function deletePet(id: number, userId: number) {
  const deletedCount = await Pet.destroy({
    where: { id, userId },
  });

  if (deletedCount === 0) {
    throw new Error(
      "Mascota no encontrada o no tenés permiso para eliminarla.",
    );
  }

  try {
    await algoliaClient.deleteObject({
      indexName: algoliaIndex,
      objectID: String(id),
    });
  } catch (algoliaErr) {
    console.error("Error al eliminar en Algolia:", algoliaErr);
  }

  return deletedCount;
}
