import { messaging } from "../services/firebase.js";
import { getToken, onMessage } from "firebase/messaging";

export const PushTest = {
  async init() {
    // IMPORTANTE: Gere sua VAPID Key no Firebase Console:
    // Project Settings > Cloud Messaging > Web Configuration > Web Push certificates
    // Se não tiver uma, clique em "Generate Key pair" e cole abaixo.
    const VAPID_KEY =
      "BJyGNShirOxJHEZnL4YT3O0C8c9u3CMQxf1tjacs4R78xxnF_oue2GOyuYx-lXpU4BOfXUUauvfyQpPEVksyhYY";

    if (VAPID_KEY === "SUA_VAPID_KEY_AQUI") {
      alert(
        "⚠️ Configure a VAPID_KEY no arquivo src/utils/pushTest.js para testar!"
      );
      console.warn(
        "Vá em: Project Settings > Cloud Messaging > Web Configuration"
      );
      return;
    }

    try {
      // 1. Garante que o Service Worker está pronto antes de pedir o token.
      const swRegistration = await navigator.serviceWorker.ready;

      console.log("Solicitando permissão de notificação...");
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // 2. Passa o Service Worker correto para o Firebase.
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });
        console.log(
          "%c TOKEN FCM (Copie para testar):",
          "color: green; font-weight: bold; font-size: 14px;"
        );
        console.log(token);
        alert("Token gerado! Abra o console (F12) para copiar o token.");

        onMessage(messaging, (payload) => {
          console.log("Mensagem recebida (Foreground):", payload);
          alert(
            `🔔 Push Recebido:\n${payload.notification?.title}\n${payload.notification?.body}`
          );
        });
      } else {
        alert("Permissão de notificação negada.");
      }
    } catch (error) {
      console.error("Erro PushTest:", error);
      alert("Erro: " + error.message);
    }
  },
};
