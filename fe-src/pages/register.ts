import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";

export class RegisterPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addListeners();
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 20px; display: flex; flex-direction: column; align-items: center;">
        <h2>Crear Cuenta</h2>
        
        <form class="register-form" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 300px; margin-top: 20px;">
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="name">Nombre</label>
            <input type="text" name="name" id="name" required style="padding: 8px;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required style="padding: 8px;" />
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="password">Contraseña</label>
            <input type="password" name="password" id="password" required style="padding: 8px;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="password-confirm">Confirmar Contraseña</label>
            <input type="password" name="password-confirm" id="password-confirm" required style="padding: 8px;" />
          </div>
          
          <button type="submit" style="padding: 10px; background-color: #FF6B6B; color: white; border: none; font-weight: bold; cursor: pointer; margin-top: 10px;">
            Registrarme
          </button>
        </form>
        
        <p class="error-msg" style="color: red; display: none; margin-top: 15px; text-align: center;"></p>
      </main>
    `;
  }

  addListeners() {
    const form = this.querySelector(".register-form") as HTMLFormElement;
    const errorMsg = this.querySelector(".error-msg") as HTMLParagraphElement;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";

      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("password-confirm") as string;

      if (password !== confirmPassword) {
        errorMsg.textContent = "Las contraseñas no coinciden.";
        errorMsg.style.display = "block";
        return;
      }

      try {
        // Asegurate de que esta ruta coincida con el endpoint de creación de usuario de tu backend
        await fetchAPI("/auth", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });

        alert("Cuenta creada con éxito. Ahora podés iniciar sesión.");
        Router.go("/ingresar");
      } catch (error: any) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
      }
    });
  }
}
customElements.define("register-page", RegisterPage);
