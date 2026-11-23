import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import Dropzone from "dropzone";
import L from "leaflet";

export class ReportSightingPage extends HTMLElement {
  location: any;
  petId: string = "";
  petName: string = "";
  petImageUrl: string = "";
  pictureBase64: string = "";
  lat: number = -37.4615;
  lng: number = -61.9341;

  async connectedCallback() {
    this.petId = this.location?.params?.id || "";

    if (!this.petId) {
      Router.go("/");
      return;
    }

    try {
      const pet = await fetchAPI(`/pets/${this.petId}`);
      this.petName = pet.name || "";
      this.petImageUrl = pet.petImageUrl || "";
      if (pet.lat && pet.lng) {
        this.lat = Number(pet.lat);
        this.lng = Number(pet.lng);
      }
    } catch {
      alert("No se encontró la mascota solicitada.");
      Router.go("/");
      return;
    }

    this.render();
    this.addListeners();

    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
        <h2 style="margin-bottom: 10px; color: #333; text-align: center;">
          Reportar avistamiento${this.petName ? ` de ${this.petName}` : ""}
        </h2>

        ${
          this.petImageUrl
            ? `<img src="${this.petImageUrl}" alt="${this.petName}" style="width: 100%; max-width: 400px; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ccc;" />`
            : ""
        }
        
        <form class="sighting-form" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 400px;">
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="reporterName" style="font-weight: bold;">Tu Nombre</label>
            <input type="text" name="reporterName" id="reporterName" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="phone" style="font-weight: bold;">Tu Teléfono</label>
            <input type="tel" name="phone" id="phone" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold;">Foto de la mascota (Opcional)</label>
            <div id="foto-avistamiento-dropzone" class="dropzone" style="border: 2px dashed #4A90E2; border-radius: 4px; background: #f9f9f9; padding: 20px; text-align: center; cursor: pointer;">
              <div class="dz-message" data-dz-message>
                <span style="font-size: 16px; color: #666;">Haz clic o arrastrá una foto acá</span>
              </div>
            </div>
          </div>

          <!-- MAPA INTERACTIVO CON LEAFLET -->
          <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 10px;">
            
            <div id="map" style="width: 100%; height: 250px; border-radius: 8px; border: 1px solid #ccc; z-index: 1;"></div>
            
            <p style="font-size: 13px; color: #333; text-align: center; margin: 10px 0;">
              Buscá un punto de referencia para reportar la mascota. Hacé clic en el mapa o arrastrá el marcador azul.
            </p>
            
            <label style="font-weight: bold; font-size: 14px;">UBICACIÓN (Ciudad, Barrio)</label>
            <input type="text" name="location" id="location" placeholder="LA PLATA, ARGENTINA" required style="padding: 12px; border: 1px solid #000; border-radius: 4px; text-transform: uppercase;" />
          </div>
          
          <button type="submit" id="submit-btn" style="padding: 15px; background-color: #FF6B6B; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px;">
            Enviar aviso al dueño
          </button>
        </form>
        
        <p class="error-msg" style="color: red; display: none; margin-top: 15px; text-align: center;"></p>
      </main>
    `;
  }

  initMap() {
    L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.9.4/dist/images/";

    const initialLat = this.lat;
    const initialLng = this.lng;

    const map = L.map("map").setView([initialLat, initialLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      this.lat = lat;
      this.lng = lng;
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        map.setView([userLat, userLng], 14);
        marker.setLatLng([userLat, userLng]);

        this.lat = userLat;
        this.lng = userLng;
      });
    }
  }

  addListeners() {
    const form = this.querySelector(".sighting-form") as HTMLFormElement;
    const errorMsg = this.querySelector(".error-msg") as HTMLParagraphElement;
    const submitBtn = this.querySelector("#submit-btn") as HTMLButtonElement;

    const dropzoneElement = this.querySelector(
      "#foto-avistamiento-dropzone",
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";

      if (Number.isNaN(this.lat) || Number.isNaN(this.lng)) {
        errorMsg.textContent = "Por favor, marcá la ubicación en el mapa.";
        errorMsg.style.display = "block";
        return;
      }

      const formData = new FormData(form);
      const reporterName = formData.get("reporterName") as string;
      const phone = formData.get("phone") as string;
      const location = formData.get("location") as string;

      submitBtn.textContent = "Enviando aviso...";
      submitBtn.disabled = true;

      try {
        await fetchAPI(`/pets/${this.petId}/report`, {
          method: "POST",
          body: JSON.stringify({
            reporterName,
            phone,
            location,
            lat: this.lat,
            lng: this.lng,
            pictureData: this.pictureBase64,
          }),
        });

        alert(
          "¡Aviso enviado! El dueño de la mascota recibirá tu información.",
        );
        Router.go("/");
      } catch (error: any) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
        submitBtn.textContent = "Enviar aviso al dueño";
        submitBtn.disabled = false;
      }
    });
  }
}
customElements.define("report-sighting-page", ReportSightingPage);
