import { Router } from "@vaadin/router";
import { state } from "./state";

const API_BASE_URL =
  window.location.hostname === "localhost" && window.location.port === "1234"
    ? "http://localhost:3000"
    : "";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = state.getState().token || localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401 && endpoint !== "/auth/token") {
    state.clearToken();
    Router.go("/ingresar");
    throw new Error(data?.error || "Sesión expirada. Volvé a iniciar sesión.");
  }

  if (!res.ok) {
    throw new Error(data?.error || "Error en la API");
  }

  return data;
}
