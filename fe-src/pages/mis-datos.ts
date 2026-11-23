import { Router } from "@vaadin/router";
import { fetchAPI } from "../api";
import { state } from "../state";

export class MisDatosPage extends HTMLElement {
  fullname: string = ""; // Guardamos el nombre real acá

  async connectedCallback() {
    const token = state.getState().token || localStorage.getItem("token");
    if (!token) {
      Router.go("/ingresar");
      return;
    }

    // 1. Renderizamos una versión inicial (sin datos aún)
    this.render();

    // 2. Buscamos los datos reales al backend
    await this.fetchUserData();
  }

  async fetchUserData() {
    try {
      const userData = await fetchAPI("/user/me");

      // Asumiendo que tu modelo de usuario tiene la columna "fullname"
      this.fullname = userData.name || "";

      // Volvemos a renderizar para inyectar el valor real en el HTML
      this.render();
      this.addListeners();
    } catch (error) {
      console.error("Error al cargar los datos del usuario:", error);
    }
  }

  render() {
    this.innerHTML = `
      <custom-header></custom-header>
      
      <main style="padding: 30px 20px; display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
        <h2 style="margin-bottom: 20px; color: #333; font-size: 28px;">Mis Datos</h2>
        
        <form class="datos-form" style="display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 350px;">
          
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="fullname" style="font-weight: bold; font-size: 14px;">Nombre completo</label>
            <!-- Inyectamos el this.fullname y le ponemos autocomplete="off" -->
            <input type="text" name="fullname" id="fullname" value="${this.fullname}" autocomplete="off" placeholder="Ej: Juan Pérez" required style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="password" style="font-weight: bold; font-size: 14px;">Nueva contraseña (opcional)</label>
            <!-- El new-password es la clave para que Chrome/Edge/Firefox dejen de autocompletar el email arriba -->
            <input type="password" name="password" id="password" autocomplete="new-password" placeholder="Dejar en blanco para no cambiar" style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;" />
          </div>
          
          <button type="submit" id="submit-btn" style="padding: 15px; background-color: #FF6B6B; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px;">
            Guardar cambios
          </button>
        </form>
        
        <p class="status-msg" style="display: none; margin-top: 15px; text-align: center; font-weight: bold;"></p>
      </main>
    `;
  }

  addListeners() {
    const form = this.querySelector(".datos-form") as HTMLFormElement;
    const submitBtn = this.querySelector("#submit-btn") as HTMLButtonElement;
    const statusMsg = this.querySelector(".status-msg") as HTMLParagraphElement;

    // Si el usuario hace submit antes de que carguen los datos, evitamos que rompa
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const fullname = formData.get("fullname") as string;
      const password = formData.get("password") as string;

      const bodyData: any = { fullname };
      if (password) {
        bodyData.password = password;
      }

      submitBtn.textContent = "Guardando...";
      submitBtn.disabled = true;
      statusMsg.style.display = "none";

      try {
        await fetchAPI("/user/me", {
          method: "PUT",
          body: JSON.stringify(bodyData),
        });

        statusMsg.textContent = "✅ Datos actualizados correctamente";
        statusMsg.style.color = "green";
        statusMsg.style.display = "block";
      } catch (error: any) {
        statusMsg.textContent = "❌ Error: " + error.message;
        statusMsg.style.color = "red";
        statusMsg.style.display = "block";
      } finally {
        submitBtn.textContent = "Guardar cambios";
        submitBtn.disabled = false;
      }
    });
  }
}
customElements.define("mis-datos-page", MisDatosPage);
