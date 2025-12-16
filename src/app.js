import { router } from "./router/router.js";

// Escuta mudanças na URL (navegação)
window.addEventListener("hashchange", router);

// Carrega a rota inicial ao abrir o app
window.addEventListener("DOMContentLoaded", router);

console.log("App inicializado");
