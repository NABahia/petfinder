import { Resend } from "resend";
import { Report, Pet, User } from "../models";
import { uploadImageToCloudinary } from "../lib/cloudinary";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function createReport(
  petId: number,
  reportData: {
    reporterName: string;
    phone: string;
    location: string;
    lat?: number;
    lng?: number;
    pictureData?: string;
  },
) {
  const reporterName = reportData.reporterName?.trim();
  const phone = reportData.phone?.trim();
  const location = reportData.location?.trim();

  if (!reporterName || !phone || !location) {
    throw new Error(
      "Faltan datos obligatorios para el reporte (reporterName, phone, location).",
    );
  }

  const pet = await Pet.findByPk(petId);
  if (!pet) {
    throw new Error("La mascota reportada no existe.");
  }

  const userId = pet.getDataValue("userId");
  const owner = await User.findByPk(userId);
  if (!owner) {
    throw new Error("No se encontró al dueño de esta mascota.");
  }

  let pictureUrl = "";
  if (reportData.pictureData && reportData.pictureData.startsWith("data:image")) {
    pictureUrl = await uploadImageToCloudinary(reportData.pictureData);
  }

  const lat =
    reportData.lat !== undefined && !Number.isNaN(Number(reportData.lat))
      ? Number(reportData.lat)
      : null;
  const lng =
    reportData.lng !== undefined && !Number.isNaN(Number(reportData.lng))
      ? Number(reportData.lng)
      : null;

  const newReport = await Report.create({
    reporterName,
    reporterPhone: phone,
    location,
    lat,
    lng,
    pictureUrl: pictureUrl || null,
    petId,
  });

  const petName = escapeHtml(String(pet.getDataValue("name") || "tu mascota"));
  const safeReporterName = escapeHtml(reporterName);
  const safeLocation = escapeHtml(location);
  const safePhone = escapeHtml(phone);

  const mapsSection =
    lat !== null && lng !== null
      ? `
          <div style="margin: 20px 0;">
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="background-color: #4A90E2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Ver ubicación exacta en el mapa
            </a>
          </div>
        `
      : "";

  const photoSection = pictureUrl
    ? `
          <div style="margin: 20px 0;">
            <p><strong>Foto enviada:</strong></p>
            <img src="${pictureUrl}" alt="Foto del avistamiento" style="max-width: 100%; border-radius: 8px;" />
          </div>
        `
    : "";

  let emailSent = false;
  try {
    const { error } = await resend.emails.send({
      from: (process.env.EMAIL_FROM as string) || "onboarding@resend.dev",
      to: owner.getDataValue("email"),
      subject: `¡Avistamiento reportado! Alguien vio a ${pet.getDataValue("name")}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #FF6B6B;">Tengo información sobre tu mascota</h2>
          <p><strong>${safeReporterName}</strong> reportó haber visto a <strong>${petName}</strong> cerca de:</p>
          <p>📍 <strong>${safeLocation}</strong></p>
          ${mapsSection}
          ${photoSection}
          <p>Por favor, comunicate urgente a este número:</p>
          <h3>📞 ${safePhone}</h3>
          <p>Esperamos que se reencuentren pronto.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error devuelto por Resend al enviar email:", error);
    } else {
      emailSent = true;
    }
  } catch (error) {
    console.error("Excepción al enviar el email por Resend:", error);
  }

  return { report: newReport, emailSent };
}
