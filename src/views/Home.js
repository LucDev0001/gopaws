import { auth, db, messaging } from "../services/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";
import { toastService } from "../utils/toastService.js";
import { dbService } from "../services/dbService.js";
import ManagerDashboard from "./dashboards/ManagerDashboard.js";
import WalkerDashboard from "./dashboards/WalkerDashboard.js";
import TutorDashboard from "./dashboards/TutorDashboard.js";

// Armazena a função de limpeza do dashboard atual
let currentDashboardUnmount = null;

export default {
  async getHtml() {
    // Retorna um Skeleton Loading inicial
    return `
            <div id="home-content" class="h-full w-full bg-gray-50 flex items-center justify-center">
                <div class="animate-pulse flex flex-col items-center">
                    <div class="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                    <div class="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
            </div>
        `;
  },

  async init() {
    const user = auth.currentUser;
    if (!user) return; // Router cuida do redirect

    // --- ADMIN REDIRECT ---
    if (user.uid === "ozSeS2w168YYgQ3oriN0IDvt3sQ2") {
      window.location.hash = "/admin";
      return;
    }

    // 1. Descobrir Role do Usuário
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      toastService.error("Perfil não encontrado. Faça login novamente.");
      await signOut(auth);
      return;
    }
    // Injeta o UID no objeto de dados para que os dashboards possam usá-lo
    const userData = { uid: user.uid, ...userDoc.data() };
    const container = document.getElementById("home-content");

    // --- CONFIGURAÇÃO DE NOTIFICAÇÕES (AUTO) ---
    try {
      // 1. Solicita permissão e pega o token
      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const swReg = await navigator.serviceWorker.ready;
          const token = await getToken(messaging, {
            vapidKey:
              "BJyGNShirOxJHEZnL4YT3O0C8c9u3CMQxf1tjacs4R78xxnF_oue2GOyuYx-lXpU4BOfXUUauvfyQpPEVksyhYY",
            serviceWorkerRegistration: swReg,
          });

          if (token) {
            // Salva no Firestore para uso futuro (Cloud Functions)
            await dbService.saveFCMToken(user.uid, token);
          }
        }
      }

      // 2. Listener para mensagens com o App ABERTO (Foreground)
      onMessage(messaging, (payload) => {
        console.log("Push recebido em foreground:", payload);
        toastService.info(
          `🔔 ${payload.notification.title}: ${payload.notification.body}`
        );
      });
    } catch (err) {
      console.warn("Erro ao configurar notificações:", err);
    }

    if (userData.role === "walker") {
      currentDashboardUnmount = await WalkerDashboard.render(
        container,
        userData
      );
    } else if (userData.role === "manager") {
      currentDashboardUnmount = await ManagerDashboard.render(
        container,
        userData
      );
    } else {
      currentDashboardUnmount = await TutorDashboard.render(
        container,
        userData
      );
    }
  },

  async unmount() {
    if (currentDashboardUnmount) {
      currentDashboardUnmount();
      currentDashboardUnmount = null;
    }
  },
};
