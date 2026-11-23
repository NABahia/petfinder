import { Router } from "@vaadin/router";
import { state } from "../state";

export class Header extends HTMLElement {
  menuOpen: boolean = false;

  connectedCallback() {
    this.render();
  }

  render() {
    const isLoggedIn = Boolean(
      state.getState().token || localStorage.getItem("token"),
    );

    this.innerHTML = `
      <header style="position: relative; background-color: #FF6B6B; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white; font-family: sans-serif;">
        <h2 id="logo" style="margin: 0; cursor: pointer; font-size: 24px;">🐾 PetFinder</h2>
        <nav>
          <button id="menu-toggle" aria-label="Abrir menú" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 26px; padding: 4px 8px;">
            ${this.menuOpen ? "✕" : "☰"}
          </button>
        </nav>

        <div id="dropdown-menu" style="display: ${this.menuOpen ? "flex" : "none"}; position: absolute; top: 100%; right: 0; left: 0; background-color: #2c2c2c; flex-direction: column; padding: 20px; gap: 12px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          ${
            isLoggedIn
              ? `
                <button class="menu-link" data-route="/dashboard" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">📋 Mi Panel</button>
                <button class="menu-link" data-route="/mis-datos" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">👤 Mis datos</button>
                <button class="menu-link" data-route="/mis-mascotas" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">🐾 Mis mascotas reportadas</button>
                <button class="menu-link" data-route="/reportar" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">📢 Reportar mascota</button>
                <hr style="width: 100%; border: 0; border-top: 1px solid #444; margin: 4px 0;" />
                <button id="logout-btn" style="background: none; border: none; color: #FF6B6B; font-size: 18px; font-weight: bold; text-align: left; padding: 10px; cursor: pointer;">🚪 Cerrar sesión</button>
              `
              : `
                <button class="menu-link" data-route="/" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">🏠 Inicio</button>
                <button class="menu-link" data-route="/ingresar" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">👤 Ingresar</button>
                <button class="menu-link" data-route="/registro" style="background: none; border: none; color: white; font-size: 18px; text-align: left; padding: 10px; cursor: pointer;">📝 Crear cuenta</button>
              `
          }
        </div>
      </header>
    `;

    this.querySelector("#logo")?.addEventListener("click", () => {
      this.menuOpen = false;
      Router.go("/");
    });

    this.querySelector("#menu-toggle")?.addEventListener("click", () => {
      this.menuOpen = !this.menuOpen;
      this.render();
    });

    this.querySelectorAll(".menu-link").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const route = (e.currentTarget as HTMLButtonElement).getAttribute(
          "data-route",
        );
        this.menuOpen = false;
        this.render();
        if (route) Router.go(route);
      });
    });

    this.querySelector("#logout-btn")?.addEventListener("click", () => {
      state.clearToken();
      this.menuOpen = false;
      this.render();
      Router.go("/");
    });
  }
}
customElements.define("custom-header", Header);
