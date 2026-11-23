import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import { state } from "../state";

export class MisMascotasPage extends HTMLElement {
  misMascotas: any[] = [];

  async connectedCallback() {
    const token = state.getState().token || localStorage.getItem("token");
    if (!token) {
      Router.go("/ingresar");
      return;
    }

    this.render(); // Render inicial (estado de carga)
    await this.fetchMisMascotas();
  }

  async fetchMisMascotas() {
    const container = this.querySelector(
      "#mascotas-container",
    ) as HTMLDivElement;
    const loadingMsg = this.querySelector(
      "#loading-msg",
    ) as HTMLParagraphElement;

    try {
      // Ajustá esta ruta al endpoint que trae las mascotas del usuario logueado
      const response = await fetchAPI("/user/me/pets");
      this.misMascotas = response; // Ajustá si tu back devuelve response.mascotas o algo similar

      loadingMsg.style.display = "none";
      this.renderMascotas(container);
    } catch (error) {
      loadingMsg.textContent = "Error al cargar tus mascotas.";
      loadingMsg.style.color = "red";
    }
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 30px 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="margin-bottom: 30px; color: #333; font-size: 28px; text-align: center;">Mis Mascotas Reportadas</h2>
        
        <p id="loading-msg" style="color: #4A90E2; font-weight: bold;">Cargando tus mascotas... 🐾</p>
        
        <div id="mascotas-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; width: 100%;">
          <!-- Acá se inyectan las cards -->
        </div>
      </main>
    `;
  }

  renderMascotas(container: HTMLDivElement) {
    if (this.misMascotas.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; margin-top: 40px;">
          <p style="color: #666; font-size: 18px; margin-bottom: 20px;">Aún no reportaste ninguna mascota perdida.</p>
          <button id="btn-crear-primera" style="padding: 12px 20px; background-color: #FF6B6B; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            Reportar mascota
          </button>
        </div>
      `;
      const btn = container.querySelector("#btn-crear-primera");
      if (btn) btn.addEventListener("click", () => Router.go("/reportar"));
      return;
    }

    container.innerHTML = this.misMascotas
      .map((pet) => {
        const isFound = pet.status === "found";
        const badgeStyle = isFound
          ? "background-color: #e6f7ed; color: #1b7f46;"
          : "background-color: #ffeaea; color: #c0392b;";
        const badgeText = isFound ? "✅ Encontrada" : "🔎 Perdida";

        return `
      <div style="border: 2px solid #000; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background-color: white;">
        <img src="${pet.petImageUrl || "https://via.placeholder.com/300x200?text=Sin+Foto"}" alt="${pet.name}" style="width: 100%; height: 200px; object-fit: cover; border-bottom: 2px solid #000;" />
        
        <div style="padding: 15px; display: flex; flex-direction: column; gap: 15px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <h3 style="margin: 0; font-size: 22px; font-weight: bold; color: #333;">${pet.name}</h3>
              <span style="font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 12px; ${badgeStyle}">
                ${badgeText}
              </span>
            </div>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">📍 ${pet.location}</p>
          </div>
          
          <button class="edit-btn" data-id="${pet.id}" style="width: 100%; padding: 10px; background-color: #333; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 14px; cursor: pointer; transition: all 0.2s; text-align: center;">
            ✏️ EDITAR MASCOTA
          </button>
        </div>
      </div>
    `;
      })
      .join("");

    // Escuchamos el clic en "EDITAR MASCOTA"
    const editButtons = container.querySelectorAll(".edit-btn");
    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const petId = target.getAttribute("data-id");
        Router.go(`/editar-mascota/${petId}`);
      });
    });
  }
}
customElements.define("mis-mascotas-page", MisMascotasPage);
