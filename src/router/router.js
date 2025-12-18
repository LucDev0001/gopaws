import Home from "../views/Home.js";
import ActiveWalk from "../views/ActiveWalk.js";
import Login from "../views/Login.js";
import Landing from "../views/Landing.js";
import RegisterTutor from "../views/RegisterTutor.js";
import Admin from "../views/Admin.js";
import RegisterManager from "../views/RegisterManager.js";
import WalkSummary from "../views/WalkSummary.js";
import Terms from "../views/Terms.js";
import Privacy from "../views/Privacy.js";
import MyPets from "../views/MyPets.js";
import InstallIOS from "../views/InstallIOS.js";

// --- NOVOS IMPORTS DE PERFIL ---
// Certifique-se de que os arquivos estão nesta pasta ou ajuste o caminho "../views/..."
import ManagerProfile from "../views/profiles/ManagerProfile.js";
import TutorProfile from "../views/profiles/TutorProfile.js";
import WalkerProfile from "../views/profiles/WalkerProfile.js";

import { auth } from "../services/firebase.js";

// --- CONFIGURAÇÕES ---
const ADMIN_UIDS = ["ozSeS2w168YYgQ3oriN0IDvt3sQ2"]; // Lista de Admins permitidos

const PUBLIC_ROUTES = [
  "/landing",
  "/register-tutor",
  "/register-manager",
  "/login",
  "/terms",
  "/privacy",
  "/install-ios",
];

const routes = {
  "/": Home,
  "/landing": Landing,
  "/register-tutor": RegisterTutor,
  "/admin": Admin,
  "/register-manager": RegisterManager,
  "/walk": ActiveWalk,
  "/login": Login,
  "/summary": WalkSummary,
  "/terms": Terms,
  "/privacy": Privacy,
  "/my-pets": MyPets,
  "/install-ios": InstallIOS,

  // --- NOVAS ROTAS DE PERFIL ---
  "/profile/manager": ManagerProfile,
  "/profile/tutor": TutorProfile,
  "/profile/walker": WalkerProfile,
};

// Armazena a view atual para poder chamar o unmount() depois
let currentView = null;

export const router = async () => {
  // 1. Identificar a rota atual (hash ou pathname)
  const fullPath = location.hash.slice(1) || "/";
  const path = fullPath.split("?")[0]; // Remove query params para encontrar a rota

  // Define o título da aba do navegador
  document.title = "Go Paws";

  // 2. AUTH GUARD: Verificar autenticação
  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });

  // 2.1 Admin Guard
  if (path === "/admin") {
    if (!user || !ADMIN_UIDS.includes(user.uid)) {
      console.warn("Acesso de administrador negado.");
      return navigateTo("/"); // Redireciona não-admins
    }
  }

  // Se não tem usuário e não é rota pública, manda pra landing/login
  if (!user && !PUBLIC_ROUTES.includes(path) && path !== "/admin") {
    return navigateTo("/landing");
  }

  // 3. Selecionar a View correspondente
  // Se a rota não existir, volta para Home (ou poderia ser uma 404)
  const View = routes[path] || Home;

  // 4. CICLO DE VIDA: Desmontar a view anterior (Limpeza de listeners, timers, etc)
  if (currentView && currentView.unmount) {
    // console.log("Desmontando view anterior...");
    await currentView.unmount();
  }

  // 5. Injetar o HTML (Renderização)
  const app = document.getElementById("app");
  // Pequena proteção caso View.getHtml falhe
  try {
    app.innerHTML = await View.getHtml();
  } catch (error) {
    console.error("Erro ao renderizar view:", error);
    app.innerHTML = "<p>Erro ao carregar a página.</p>";
  }

  // 6. CICLO DE VIDA: Inicializar a nova view (Scripts/Eventos)
  if (View.init) {
    await View.init();
  }

  // 7. Atualizar referência
  currentView = View;
};

export const navigateTo = (url) => {
  window.location.hash = url;
  // O evento hashchange no main.js/index.js cuidará de chamar o router novamente
};
