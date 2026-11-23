import { Router } from "@vaadin/router";
import { state } from "../state";

export class DashboardPage extends HTMLElement {
  connectedCallback() {
    const token = state.getState().token || localStorage.getItem("token");
    if (!token) {
      Router.go("/ingresar");
      return;
    }

    this.render();
    this.addListeners();
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 40px 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
        <h2 style="margin-bottom: 40px; color: #333; font-size: 28px;">Mi Panel</h2>
        
        <div style="display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 350px;">
          
          <button id="btn-mis-datos" style="padding: 20px; background-color: white; color: #333; border: 2px solid #FF6B6B; border-radius: 8px; font-weight: bold; font-size: 18px; cursor: pointer; transition: all 0.2s; text-align: center;">
            👤 Mis datos
          </button>

          <button id="btn-mis-mascotas" style="padding: 20px; background-color: white; color: #333; border: 2px solid #FF6B6B; border-radius: 8px; font-weight: bold; font-size: 18px; cursor: pointer; transition: all 0.2s; text-align: center;">
            🐾 Mis mascotas reportadas
          </button>

          <button id="btn-reportar" style="padding: 20px; background-color: #FF6B6B; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 18px; cursor: pointer; transition: all 0.2s; text-align: center;">
            📢 Reportar mascota
          </button>

        </div>
      </main>
    `;
  }

  addListeners() {
    const btnMisDatos = this.querySelector(
      "#btn-mis-datos",
    ) as HTMLButtonElement;
    const btnMisMascotas = this.querySelector(
      "#btn-mis-mascotas",
    ) as HTMLButtonElement;
    const btnReportar = this.querySelector(
      "#btn-reportar",
    ) as HTMLButtonElement;

    btnMisDatos.addEventListener("click", () => {
      Router.go("/mis-datos");
    });

    btnMisMascotas.addEventListener("click", () => {
      Router.go("/mis-mascotas");
    });

    btnReportar.addEventListener("click", () => {
      Router.go("/reportar");
    });
  }
}
customElements.define("dashboard-page", DashboardPage);
