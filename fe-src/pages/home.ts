import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import { state } from "../state";

export class HomePage extends HTMLElement {
  pets: any[] = [];

  connectedCallback() {
    this.render();
    this.addListeners();
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 30px 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        
        <h1 style="font-size: 36px; font-weight: bold; text-align: center; color: #FF6B6B; margin-bottom: 10px;">
          PetFinder
        </h1>
        
        <!-- Botones Principales (Los dos caminos) -->
        <div style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 350px; margin-bottom: 50px; margin-top: 20px;">
          
          <button id="btn-ingresar-top" style="padding: 15px; background-color: #333; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            👤 Soy dueño (Ingresar)
          </button>

          <button id="btn-reportar-top" style="padding: 15px; background-color: #FF6B6B; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            👀 Vi una mascota perdida
          </button>
          
        </div>

        <hr style="width: 100%; border: 1px solid #eee; margin-bottom: 40px;" />

        <!-- Sección de búsqueda para los que vieron una mascota -->
        <div id="search-section" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <h2 style="font-size: 24px; font-weight: bold; text-align: center; color: #333; margin-bottom: 15px;">
            Mascotas perdidas cerca tuyo
          </h2>
          
          <p style="text-align: center; font-size: 16px; color: #666; margin-bottom: 30px; line-height: 1.5;">
            Para ver las mascotas reportadas cerca tuyo necesitamos permiso para conocer tu ubicación.
          </p>
          
          <button id="location-btn" style="width: 100%; max-width: 350px; padding: 15px; background-color: #4A90E2; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.2s;">
            📍 Dar mi ubicación
          </button>

          <p id="loading-msg" style="display: none; margin-top: 20px; color: #4A90E2; font-weight: bold;">
            Buscando mascotas... 🐾
          </p>
          
          <div id="pets-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; width: 100%; margin-top: 40px;">
            <!-- Las tarjetas de mascotas se inyectan acá -->
          </div>
        </div>

      </main>
    `;
  }

  addListeners() {
    const btnIngresar = this.querySelector(
      "#btn-ingresar-top",
    ) as HTMLButtonElement;
    const btnReportar = this.querySelector(
      "#btn-reportar-top",
    ) as HTMLButtonElement;

    const searchSection = this.querySelector(
      "#search-section",
    ) as HTMLDivElement;
    const locationBtn = this.querySelector(
      "#location-btn",
    ) as HTMLButtonElement;
    const loadingMsg = this.querySelector(
      "#loading-msg",
    ) as HTMLParagraphElement;
    const petsContainer = this.querySelector(
      "#pets-container",
    ) as HTMLDivElement;

    // --- Camino 1: Dueños ---
    btnIngresar.addEventListener("click", () => {
      const token = state.getState().token || localStorage.getItem("token");
      if (token) {
        Router.go("/dashboard");
      } else {
        Router.go("/ingresar");
      }
    });

    // --- Camino 2: Los que vieron una mascota ---
    btnReportar.addEventListener("click", () => {
      // Hacemos scroll suave hasta la sección de buscar
      searchSection.scrollIntoView({ behavior: "smooth" });
      // Opcional: Podés disparar el click de ubicación automáticamente si querés
      // locationBtn.click();
    });

    // --- Lógica del mapa y Algolia ---
    locationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          state.setLocation(lat, lng);

          locationBtn.style.display = "none";
          loadingMsg.style.display = "block";
          loadingMsg.textContent = "Buscando mascotas... 🐾";

          try {
            const response = await fetchAPI(
              `/pets/cerca?lat=${lat}&lng=${lng}`,
            );
            this.pets = response.mascotas;

            loadingMsg.style.display = "none";
            this.renderPets(petsContainer);
          } catch (error: any) {
            loadingMsg.textContent =
              "Error al buscar mascotas: " + error.message;
            locationBtn.style.display = "block";
          }
        },
        () => {
          alert(
            "Necesitamos tu ubicación para mostrarte las mascotas perdidas. Por favor, habilita los permisos en tu navegador.",
          );
        },
      );
    });
  }

  renderPets(container: HTMLDivElement) {
    if (this.pets.length === 0) {
      container.innerHTML = `<p style="text-align: center; width: 100%; color: #666;">No se encontraron mascotas perdidas cerca de tu ubicación.</p>`;
      return;
    }

    container.innerHTML = this.pets
      .map(
        (pet) => `
      <div style="border: 2px solid #000; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background-color: white;">
        <img src="${pet.petImageUrl || "https://via.placeholder.com/300x200?text=Mascota"}" alt="${pet.name}" style="width: 100%; height: 200px; object-fit: cover; border-bottom: 2px solid #000;" />
        
        <div style="padding: 15px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${pet.name}</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">📍 ${pet.location}</p>
          </div>
          
          <button class="contact-btn" data-id="${pet.objectID}" style="padding: 8px 12px; background-color: transparent; color: #333; border: 2px solid #000; border-radius: 4px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
            LA VI
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    const contactButtons = container.querySelectorAll(".contact-btn");
    contactButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const petId = target.getAttribute("data-id");
        Router.go(`/mascota/${petId}`);
      });
    });
  }
}
customElements.define("home-page", HomePage);
