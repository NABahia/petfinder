import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import { state } from "../state";
import Dropzone from "dropzone";

export class ReportPage extends HTMLElement {
  location: any;
  petId: string = "";
  isEditMode: boolean = false;
  petName: string = "";
  petLocation: string = "";
  petStatus: string = "lost";
  currentImageUrl: string = "";
  pictureBase64: string = "";
  lat: number = 0;
  lng: number = 0;

  async connectedCallback() {
    const token = state.getState().token || localStorage.getItem("token");
    if (!token) {
      Router.go("/ingresar");
      return;
    }

    this.petId = this.location?.params?.id || "";
    this.isEditMode = Boolean(this.petId);

    if (this.isEditMode) {
      await this.loadPetData();
    }

    this.render();
    this.addListeners();
  }

  async loadPetData() {
    try {
      const pet = await fetchAPI(`/pets/${this.petId}`);
      this.petName = pet.name || "";
      this.petLocation = pet.location || "";
      this.petStatus = pet.status || "lost";
      this.currentImageUrl = pet.petImageUrl || "";
      this.lat = Number(pet.lat) || 0;
      this.lng = Number(pet.lng) || 0;
    } catch (error: any) {
      alert("No se pudo cargar la mascota: " + error.message);
      Router.go("/mis-mascotas");
    }
  }

  render() {
    const title = this.isEditMode
      ? "Editar Mascota Reportada"
      : "Reportar Mascota Perdida";
    const submitLabel = this.isEditMode
      ? "Guardar cambios"
      : "Reportar como perdida";
    const locationStatusText =
      this.lat !== 0 && this.lng !== 0
        ? `✅ Coordenadas actuales: ${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}`
        : "";

    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
        <h2 style="margin-bottom: 20px;">${title}</h2>
        
        <form class="report-form" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 400px;">
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="name" style="font-weight: bold;">Nombre de la mascota</label>
            <input type="text" name="name" id="name" value="${this.petName}" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          ${
            this.currentImageUrl
              ? `
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label style="font-weight: bold;">Foto actual</label>
              <img src="${this.currentImageUrl}" alt="${this.petName}" style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 6px; border: 1px solid #ccc;" />
            </div>
          `
              : ""
          }

          <!-- Contenedor de Dropzone -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold;">${this.isEditMode ? "Cambiar foto (opcional)" : "Foto de la mascota"}</label>
            <div id="foto-dropzone" class="dropzone" style="border: 2px dashed #FF6B6B; border-radius: 4px; background: #f9f9f9; padding: 20px; text-align: center; cursor: pointer;">
              <div class="dz-message" data-dz-message>
                <span style="font-size: 16px; color: #666;">Haz clic o arrastrá una foto acá</span>
              </div>
            </div>
          </div>

          <!-- Mapa / Ubicación -->
          <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 10px;">
            <label style="font-weight: bold;">¿Dónde se perdió?</label>
            <button type="button" id="get-location-btn" style="padding: 10px; background-color: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
              📍 ${this.isEditMode ? "Actualizar con mi ubicación actual" : "Capturar mi ubicación actual"}
            </button>
            <p id="location-status" style="font-size: 12px; color: ${locationStatusText ? "green" : "#666"}; margin: 0;">${locationStatusText}</p>
            
            <input type="text" name="location" id="location" value="${this.petLocation}" placeholder="Ej: Barrio San Martín, Buenos Aires" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-top: 5px;" />
          </div>
          
          <button type="submit" id="submit-btn" style="padding: 15px; background-color: #FF6B6B; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 20px;">
            ${submitLabel}
          </button>

          ${
            this.isEditMode
              ? `
            <button type="button" id="toggle-status-btn" style="padding: 12px; background-color: ${this.petStatus === "found" ? "#f39c12" : "#27ae60"}; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 15px; cursor: pointer;">
              ${this.petStatus === "found" ? "🔎 Volver a marcar como perdida" : "✅ Reportar como encontrada"}
            </button>

            <button type="button" id="delete-btn" style="padding: 12px; background-color: transparent; color: #c0392b; border: 2px solid #c0392b; border-radius: 4px; font-weight: bold; font-size: 15px; cursor: pointer;">
              🗑️ Despublicar / Eliminar reporte
            </button>
          `
              : ""
          }
        </form>
        
        <p class="error-msg" style="color: red; display: none; margin-top: 15px; text-align: center;"></p>
      </main>
    `;
  }

  addListeners() {
    const form = this.querySelector(".report-form") as HTMLFormElement;
    const errorMsg = this.querySelector(".error-msg") as HTMLParagraphElement;
    const submitBtn = this.querySelector("#submit-btn") as HTMLButtonElement;

    const getLocationBtn = this.querySelector(
      "#get-location-btn",
    ) as HTMLButtonElement;
    const locationStatus = this.querySelector(
      "#location-status",
    ) as HTMLParagraphElement;

    // --- 1. Inicializar Dropzone ---
    const dropzoneElement = this.querySelector(
      "#foto-dropzone",
    ) as HTMLDivElement;

    const myDropzone = new Dropzone(dropzoneElement, {
      url: "/falsa",
      autoProcessQueue: false,
      maxFiles: 1,
      acceptedFiles: "image/*",
      thumbnailWidth: 300,
      thumbnailHeight: 300,
    });

    myDropzone.on("thumbnail", (file, dataUrl) => {
      this.pictureBase64 = dataUrl;
    });

    myDropzone.on("addedfile", () => {
      if (myDropzone.files.length > 1) {
        myDropzone.removeFile(myDropzone.files[0]);
      }
    });

    // --- 2. Lógica para obtener las coordenadas ---
    getLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationStatus.textContent =
          "❌ Tu navegador no soporta geolocalización.";
        locationStatus.style.color = "red";
        return;
      }

      locationStatus.textContent = "Buscando ubicación...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          locationStatus.textContent = `✅ Coordenadas guardadas: ${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}`;
          locationStatus.style.color = "green";
        },
        () => {
          locationStatus.textContent =
            "❌ Error al obtener ubicación. Habilitá los permisos.";
          locationStatus.style.color = "red";
        },
      );
    });

    // --- 3. Botones exclusivos de modo edición ---
    if (this.isEditMode) {
      const toggleStatusBtn = this.querySelector(
        "#toggle-status-btn",
      ) as HTMLButtonElement | null;
      const deleteBtn = this.querySelector(
        "#delete-btn",
      ) as HTMLButtonElement | null;

      toggleStatusBtn?.addEventListener("click", async () => {
        const nextStatus = this.petStatus === "found" ? "lost" : "found";
        toggleStatusBtn.disabled = true;
        try {
          await fetchAPI(`/pets/${this.petId}`, {
            method: "PUT",
            body: JSON.stringify({ status: nextStatus }),
          });
          alert(
            nextStatus === "found"
              ? "¡Qué buena noticia! Mascota marcada como encontrada."
              : "La mascota volvió a figurar como perdida.",
          );
          Router.go("/mis-mascotas");
        } catch (error: any) {
          errorMsg.textContent = error.message;
          errorMsg.style.display = "block";
          toggleStatusBtn.disabled = false;
        }
      });

      deleteBtn?.addEventListener("click", async () => {
        if (!confirm("¿Seguro que querés eliminar este reporte?")) return;
        deleteBtn.disabled = true;
        try {
          await fetchAPI(`/pets/${this.petId}`, {
            method: "DELETE",
          });
          alert("Reporte eliminado correctamente.");
          Router.go("/mis-mascotas");
        } catch (error: any) {
          errorMsg.textContent = error.message;
          errorMsg.style.display = "block";
          deleteBtn.disabled = false;
        }
      });
    }

    // --- 4. Lógica para enviar el formulario ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";

      if (!this.isEditMode && !this.pictureBase64) {
        errorMsg.textContent = "Por favor, subí una foto de la mascota.";
        errorMsg.style.display = "block";
        return;
      }

      if (this.lat === 0 && this.lng === 0) {
        errorMsg.textContent =
          "Por favor, capturá la ubicación antes de reportar.";
        errorMsg.style.display = "block";
        return;
      }

      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const location = formData.get("location") as string;

      submitBtn.textContent = "Guardando (esto puede tardar)...";
      submitBtn.disabled = true;

      try {
        const payload: any = {
          name,
          location,
          lat: this.lat,
          lng: this.lng,
        };

        if (this.pictureBase64) {
          payload.pictureData = this.pictureBase64;
        }

        if (this.isEditMode) {
          await fetchAPI(`/pets/${this.petId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          alert("¡Mascota actualizada con éxito!");
          Router.go("/mis-mascotas");
        } else {
          await fetchAPI("/pets", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          alert("¡Mascota reportada con éxito!");
          Router.go("/mis-mascotas");
        }
      } catch (error: any) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
        submitBtn.textContent = this.isEditMode
          ? "Guardar cambios"
          : "Reportar como perdida";
        submitBtn.disabled = false;
      }
    });
  }
}
customElements.define("report-page", ReportPage);
