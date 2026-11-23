import { Router } from "@vaadin/router";

const router = new Router(document.querySelector(".root"));

router.setRoutes([
  { path: "/", component: "home-page" },
  { path: "/ingresar", component: "login-page" },
  { path: "/registro", component: "register-page" },
  { path: "/reportar/:id", component: "report-page" },
  { path: "/editar-mascota/:id", component: "report-page" },
  { path: "/reportar", component: "report-page" },
  { path: "/dashboard", component: "dashboard-page" },
  { path: "/mis-datos", component: "mis-datos-page" },
  { path: "/mis-mascotas", component: "mis-mascotas-page" },
  { path: "/mascota/:id", component: "report-sighting-page" },
  // Cualquier ruta que no exista, te manda a la home
  { path: "(.*)", redirect: "/" },
]);
