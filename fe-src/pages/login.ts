import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import { state } from "../state";

export class LoginPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addListeners();
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 20px; display: flex; flex-direction: column; align-items: center;">
        <h2>Iniciar Sesión</h2>
        
        <form class="login-form" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 300px; margin-top: 20px;">
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required style="padding: 8px;" />
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="password">Contraseña</label>
            <input type="password" name="password" id="password" required style="padding: 8px;" />
          </div>
          
          <button type="submit" style="padding: 10px; background-color: #FF6B6B; color: white; border: none; font-weight: bold; cursor: pointer; margin-top: 10px;">
            Ingresar
          </button>
          <div style="margin-top: 20px; text-align: center;">
          <p>¿No tenés una cuenta?</p>
            <a id="register-link" style="color: #FF6B6B; cursor: pointer; text-decoration: underline;">Registrate acá</a>
          </div>
        </form>
        
        <p class="error-msg" style="color: red; display: none; margin-top: 15px; text-align: center;"></p>
      </main>
    `;
  }

  addListeners() {
    const form = this.querySelector(".login-form") as HTMLFormElement;
    const errorMsg = this.querySelector(".error-msg") as HTMLParagraphElement;
    this.querySelector("#register-link")?.addEventListener("click", () => {
      Router.go("/registro");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none"; // Ocultamos errores previos

      const formData = new FormData(form);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        // Le pegamos al backend (usando la ruta que configuraste para obtener el token)
        const data = await fetchAPI("/auth/token", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        // Guardamos el token globalmente (y en localStorage)
        state.setToken(data.token);

        // Redirigimos al panel del usuario
        Router.go("/dashboard");
      } catch (error: any) {
        // Mostramos el error que nos devolvió el backend
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
      }
    });
  }
}
customElements.define("login-page", LoginPage);
