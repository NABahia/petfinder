import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Falta configurar la variable CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET en el archivo .env",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Nueva función modularizada que podés reutilizar en el create o en el update
export async function uploadImageToCloudinary(
  pictureData: string,
): Promise<string> {
  if (!pictureData) return "";

  try {
    const uploadResult = await cloudinary.uploader.upload(pictureData, {
      resource_type: "image",
      discard_original_filename: true,
      width: 400,
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error en Cloudinary:", error);
    throw new Error("Fallo la subida de la imagen a Cloudinary.");
  }
}

export { cloudinary };
