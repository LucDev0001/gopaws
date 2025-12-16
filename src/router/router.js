import Home from "../views/Home.js";
import ActiveWalk from "../views/ActiveWalk.js";
import Login from "../views/Login.js";
import Landing from "../views/Landing.js";
import RegisterTutor from "../views/RegisterTutor.js";
import Admin from "../views/Admin.js";
import RegisterManager from "../views/RegisterManager.js";
import WalkSummary from "../views/WalkSummary.js";
import Profile from "../views/Profile.js";
import Terms from "../views/Terms.js";
import Privacy from "../views/Privacy.js";
import MyPets from "../views/MyPets.js";
import { auth } from "../services/firebase.js";

const routes = {
  "/": Home,
  "/landing": Landing,
  "/register-tutor": RegisterTutor,
  "/admin": Admin,
  "/register-manager": RegisterManager,
  "/walk": ActiveWalk,
  "/login": Login,
  "/summary": WalkSummary,
  "/profile": Profile,
  "/terms": Terms,
  "/privacy": Privacy,
  "/my-pets": MyPets,
};

// Armazena a view atual para poder chamar o unmount() depois
let currentView = null;

export const router = async () => {
  // 1. Identificar a rota atual (hash ou pathname)
  // Usando hash routing para simplicidade em PWA sem config de servidor
  const fullPath = location.hash.slice(1) || "/";
  const path = fullPath.split("?")[0]; // Remove query params para encontrar a rota

  // 2. AUTH GUARD: Verificar autenticação
  // Precisamos esperar o Firebase inicializar para saber se tem user
  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });

  // 2.1 Admin Guard
  if (path === "/admin") {
    // IMPORTANTE: Troque pelo seu ID de administrador
    const adminId = "ozSeS2w168YYgQ3oriN0IDvt3sQ2";
    if (!user || user.uid !== adminId) {
      console.warn("Acesso de administrador negado.");
      return navigateTo("/"); // Redireciona não-admins
    }
  }

  const publicRoutes = [
    "/landing",
    "/register-tutor",
    "/register-manager",
    "/login",
    "/terms",
    "/privacy",
  ];
  if (!user && !publicRoutes.includes(path) && path !== "/admin") {
    return navigateTo("/landing");
  }

  // 3. Selecionar a View correspondente
  const View = routes[path] || Home;

  // 4. CICLO DE VIDA: Desmontar a view anterior (Limpeza)
  if (currentView && currentView.unmount) {
    console.log("Desmontando view anterior...");
    await currentView.unmount();
  }

  // 5. Injetar o HTML (Renderização)
  const app = document.getElementById("app");
  app.innerHTML = await View.getHtml();

  // 6. CICLO DE VIDA: Inicializar a nova view (Scripts/Eventos)
  if (View.init) {
    await View.init();
  }

  // 7. Atualizar referência
  currentView = View;
};

export const navigateTo = (url) => {
  window.location.hash = url;
  // O evento hashchange cuidará de chamar o router
};
