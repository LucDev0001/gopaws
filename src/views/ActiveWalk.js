import { db, auth } from "../services/firebase.js";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { navigateTo } from "../router/router.js";
import { toastService } from "../utils/toastService.js";
import { dbService } from "../services/dbService.js";
import { Chat } from "../components/Chat.js";
import { PaymentModal } from "../components/PaymentModal.js";

let map = null;
let walkerMarker = null;
let routePolyline = null;
let watchId = null;
let unsubscribe = null;
let timerInterval = null;
let chatInstance = null;

export default {
  async getHtml() {
    return `
      <div class="h-full flex flex-col relative bg-gray-100">
          <!-- Mapa -->
          <div id="map" class="flex-1 w-full z-0"></div>

          <!-- Botão Voltar (Minimizar) -->
          <button onclick="window.location.hash='/'" class="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-[1000] text-gray-600 hover:bg-gray-100 transition active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Botão SOS (Pânico) -->
          <button id="btn-sos" class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg z-[1000] font-bold border-2 border-white animate-pulse flex items-center gap-2">
            <span>🆘</span> SOS
          </button>

          <!-- Controles do Mapa -->
          <div class="absolute top-24 right-4 flex flex-col gap-2 z-[1000]">
              <button id="btn-center-map" class="bg-white p-3 rounded-full shadow-lg text-blue-600 hover:bg-gray-100 transition active:scale-95" title="Centralizar">
                  🎯
              </button>
              <button id="btn-allow-loc" class="bg-white p-3 rounded-full shadow-lg text-green-600 hover:bg-gray-100 transition active:scale-95" title="Ativar GPS">
                  📍
              </button>
          </div>

          <!-- Painel Inferior (Status) -->
          <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-10 p-6 transition-transform duration-300" id="walk-panel">
              <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <div class="flex justify-between items-center mb-4">
                  <div>
                      <h2 class="text-xl font-bold text-gray-900" id="status-title">Aguardando início...</h2>
                      <p class="text-sm text-gray-500" id="status-subtitle">O walker está a caminho.</p>
                  </div>
                  <div class="text-right">
                      <div class="text-2xl font-bold text-gray-900" id="timer-display">00:00</div>
                      <div class="text-xs text-gray-400">Duração</div>
                  </div>
                  <div class="text-right ml-4 border-l pl-4">
                      <div class="text-2xl font-bold text-gray-900" id="distance-display">0.0 km</div>
                      <div class="text-xs text-gray-400">Distância</div>
                  </div>
              </div>

              <!-- Ações (Walker) -->
              <div id="walker-actions" class="hidden grid-cols-2 gap-3 mb-4">
                  <button id="btn-start" class="col-span-2 bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700">Iniciar Passeio</button>
                  <button id="btn-finish" class="hidden col-span-2 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700">Finalizar</button>
                  
                  <!-- Botões de Eventos (Aparecem durante o passeio) -->
                  <div id="event-actions" class="hidden col-span-2 grid-cols-2 gap-3 mt-2">
                      <button id="btn-pee" class="bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold shadow-sm hover:bg-yellow-200 border border-yellow-200 flex items-center justify-center gap-2">🟡 Xixi</button>
                      <button id="btn-poo" class="bg-orange-100 text-orange-800 py-3 rounded-xl font-bold shadow-sm hover:bg-orange-200 border border-orange-200 flex items-center justify-center gap-2">💩 Cocô</button>
                  </div>
              </div>
          </div>

          ${Chat.getHtml()}
      </div>
    `;
  },

  async init() {
    // 1. Obter ID do Passeio da URL
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const walkId = urlParams.get("id");

    if (!walkId) {
      toastService.error("Erro: ID do passeio não encontrado.");
      return navigateTo("/");
    }

    const user = auth.currentUser;

    // 2. Inicializar Mapa (Leaflet)
    // Verifica se o Leaflet foi carregado (CDN no index.html)
    if (typeof L === "undefined") {
      toastService.error("Erro ao carregar mapa. Verifique sua conexão.");
      return;
    }

    // Init Map
    map = L.map("map").setView([-23.5505, -46.6333], 15); // SP Default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // 2.5 Inicializar Chat
    chatInstance = new Chat(walkId);
    chatInstance.init();

    // Button Listeners
    document.getElementById("btn-center-map").addEventListener("click", () => {
      if (walkerMarker) {
        map.setView(walkerMarker.getLatLng(), 16);
      } else {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 16);
        });
      }
    });

    document.getElementById("btn-allow-loc").addEventListener("click", () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          toastService.success("GPS Ativo!");
          map.setView([pos.coords.latitude, pos.coords.longitude], 16);
        },
        (err) => toastService.error("Erro GPS: " + err.message)
      );
    });

    // SOS Listener
    document.getElementById("btn-sos").addEventListener("click", async () => {
      // Cria um modal moderno para confirmação
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4";
      modal.innerHTML = `
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-fade-in">
            <div class="text-5xl mb-4">🆘</div>
            <h2 class="text-2xl font-black text-red-600 mb-2">Confirmar Emergência?</h2>
            <p class="text-gray-600 mb-6 text-sm">Isso enviará um alerta imediato para a central e para os contatos de emergência com sua localização.</p>
            <div class="grid grid-cols-2 gap-3">
                <button id="cancel-sos" class="py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button id="confirm-sos" class="py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg">CONFIRMAR</button>
            </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById("cancel-sos").onclick = () => modal.remove();

      document.getElementById("confirm-sos").onclick = async () => {
        modal.remove();
        try {
          await dbService.sendSOS(walkId);
          toastService.error("🚨 ALERTA DE SOS ENVIADO COM SUCESSO!");
          // Feedback visual no botão
          const btn = document.getElementById("btn-sos");
          btn.classList.add("bg-red-800", "animate-ping");
          btn.innerText = "SOS ENVIADO";
        } catch (e) {
          console.error(e);
          toastService.error("Erro ao enviar SOS: " + e.message);
        }
      };
    });

    // Walker Actions
    const btnStart = document.getElementById("btn-start");
    const btnFinish = document.getElementById("btn-finish");

    btnStart.addEventListener("click", async () => {
      try {
        await dbService.startWalk(walkId);
        toastService.success("Passeio Iniciado!");
      } catch (e) {
        toastService.error(e.message);
      }
    });

    btnFinish.addEventListener("click", async () => {
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in";
      modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
                <div class="text-4xl mb-2">🏁</div>
                <h3 class="font-bold text-xl text-gray-900 mb-2">Finalizar Passeio?</h3>
                <p class="text-gray-500 text-sm mb-6">Certifique-se de que entregou o pet em segurança ao tutor.</p>
                <div class="flex gap-3">
                    <button id="btn-cancel-finish" class="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Voltar</button>
                    <button id="btn-confirm-finish" class="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition">Finalizar</button>
                </div>
            </div>
        `;
      document.body.appendChild(modal);

      document.getElementById("btn-cancel-finish").onclick = () =>
        modal.remove();
      document.getElementById("btn-confirm-finish").onclick = async () => {
        modal.remove();
        await dbService.finishWalk(walkId);
        // Navigation handled by snapshot listener
      };
    });

    // Event Listeners (Xixi/Cocô)
    document.getElementById("btn-pee").addEventListener("click", async () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await dbService.addEvent(
            walkId,
            "pee",
            pos.coords.latitude,
            pos.coords.longitude
          );
          toastService.success("Xixi registrado! 🟡");
        } catch (e) {
          toastService.error(e.message);
        }
      });
    });

    document.getElementById("btn-poo").addEventListener("click", async () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await dbService.addEvent(
            walkId,
            "poo",
            pos.coords.latitude,
            pos.coords.longitude
          );
          toastService.success("Cocô registrado! 💩");
        } catch (e) {
          toastService.error(e.message);
        }
      });
    });

    const showPaymentModal = async (walkData) => {
      // Find the manager to get PIX key
      if (!walkData.managerId) {
        toastService.error("Erro: Petshop não vinculado a este passeio.");
        return;
      }
      const managerDoc = await getDoc(doc(db, "users", walkData.managerId));
      if (!managerDoc.exists()) {
        toastService.error("Erro: Dados do Petshop não encontrados.");
        return;
      }
      const managerData = managerDoc.data();

      const modalHtml = PaymentModal.getHtml(
        managerData.pixKey,
        managerData.whatsappNumber,
        walkData.price
      );

      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
      PaymentModal.init();

      // The modal is self-contained. The tutor will pay and the walker will confirm.
      // We can just show a waiting message on the tutor's screen.
      const panel = document.getElementById("walk-panel");
      if (panel) {
        panel.innerHTML = `<div class="p-6 text-center"><h3 class="font-bold text-lg">Aguardando Confirmação</h3><p class="text-gray-500 text-sm">Mostre o comprovante ao walker para que ele confirme o pagamento.</p></div>`;
      }
    };

    // 3. Escutar Documento do Passeio
    unsubscribe = onSnapshot(
      doc(db, "walks", walkId),
      (docSnap) => {
        if (!docSnap.exists()) {
          toastService.error("Passeio cancelado ou não existe.");
          return navigateTo("/");
        }
        const data = docSnap.data();
        const previousStatus = this.lastStatus || data.status;

        // Atualiza UI baseada no status
        const title = document.getElementById("status-title");
        const sub = document.getElementById("status-subtitle");
        const isWalker = user.uid === data.walkerId;

        // Timer Logic
        if (data.status === "ongoing" && data.startTime) {
          if (!timerInterval) {
            const start = data.startTime.toDate();
            const updateTimer = () => {
              const now = new Date();
              const diff = Math.floor((now - start) / 1000);
              const m = Math.floor(diff / 60)
                .toString()
                .padStart(2, "0");
              const s = (diff % 60).toString().padStart(2, "0");
              const el = document.getElementById("timer-display");
              if (el) el.innerText = `${m}:${s}`;
            };
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
          }
        } else {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
        }

        if (data.status === "accepted") {
          title.innerText = "Walker Aceitou!";
          sub.innerText = "Aguardando início do trajeto.";
        } else if (data.status === "ongoing") {
          title.innerText = "Em Passeio 🐕";
          sub.innerText = "Acompanhe em tempo real.";

          // Notificação de Início (Se mudou agora)
          if (
            previousStatus !== "ongoing" &&
            Notification.permission === "granted"
          ) {
            new Notification("Passeio Iniciado! 🐕", {
              body: `O passeio com ${data.dogName} começou.`,
              icon: "/favicon.ico",
            });
          }

          // Lógica de Rastreamento (Apenas Walker)
          if (isWalker && !watchId) {
            watchId = navigator.geolocation.watchPosition(
              (pos) => {
                // Atualiza no Firebase (Tutor vai receber via snapshot abaixo)
                dbService.updateLocation(
                  walkId,
                  pos.coords.latitude,
                  pos.coords.longitude
                );
              },
              (err) => console.error(err),
              { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
          }
        } else if (data.status === "completed") {
          toastService.success("Passeio finalizado!");

          // Notificação de Fim
          if (
            previousStatus !== "completed" &&
            Notification.permission === "granted"
          ) {
            new Notification("Passeio Finalizado 🏁", {
              body: `O passeio com ${data.dogName} foi concluído com sucesso.`,
              icon: "/favicon.ico",
            });
          }
          navigateTo("/summary"); // Ir para resumo
        } else if (data.status === "payment_pending") {
          if (isWalker) {
            // Walker's view: show confirmation button
            title.innerText = "Aguardando Pagamento";

            if (data.paymentMethod === "balance") {
              sub.innerText = "Pagamento via Saldo. Confirme para finalizar.";
            } else if (
              data.paymentMethod === "cash" ||
              data.paymentMethod === "card"
            ) {
              sub.innerText =
                "Receba o pagamento (Dinheiro/Máquina) e confirme.";
            } else {
              sub.innerText = "Peça ao tutor para mostrar o comprovante PIX.";
            }

            document.getElementById("walker-actions").innerHTML = `
              <button id="btn-confirm-payment" class="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">Confirmar Pagamento</button>
            `;
            document
              .getElementById("btn-confirm-payment")
              .addEventListener("click", async () => {
                // Passa dados extras para dedução de saldo se necessário
                await dbService.confirmPayment(
                  walkId,
                  data.paymentMethod,
                  data.price,
                  data.tutorId
                );
              });
          } else {
            // Tutor's view: show payment modal
            if (data.paymentMethod === "balance") {
              const panel = document.getElementById("walk-panel");
              if (panel)
                panel.innerHTML = `<div class="p-6 text-center"><h3 class="font-bold text-lg text-green-600">Pagamento via Saldo</h3><p class="text-gray-500 text-sm">O valor será debitado automaticamente quando o walker confirmar.</p></div>`;
            } else if (
              data.paymentMethod === "cash" ||
              data.paymentMethod === "card"
            ) {
              const panel = document.getElementById("walk-panel");
              if (panel)
                panel.innerHTML = `<div class="p-6 text-center"><h3 class="font-bold text-lg">Pagamento Presencial</h3><p class="text-gray-500 text-sm">Realize o pagamento diretamente ao walker.</p></div>`;
            } else {
              showPaymentModal(data);
            }
          }
        }

        this.lastStatus = data.status;

        // Controles do Walker
        if (isWalker) {
          document.getElementById("walker-actions").classList.remove("hidden");
          document.getElementById("walker-actions").classList.add("grid");

          if (data.status === "accepted") {
            btnStart.classList.remove("hidden");
            btnFinish.classList.add("hidden");
            document.getElementById("event-actions").classList.remove("grid");
            document.getElementById("event-actions").classList.add("hidden");
          } else if (data.status === "ongoing") {
            btnStart.classList.add("hidden");
            btnFinish.classList.remove("hidden");
            document.getElementById("event-actions").classList.remove("hidden");
            document.getElementById("event-actions").classList.add("grid");
          }
        }

        // Atualiza Mapa (Marcador e Rota) para AMBOS
        if (data.lastLocation) {
          const { lat, lng } = data.lastLocation;
          if (!walkerMarker) {
            const icon = L.divIcon({
              className: "bg-transparent",
              html: '<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs">🚶</div>',
            });
            walkerMarker = L.marker([lat, lng], { icon }).addTo(map);
            map.setView([lat, lng], 16);
          } else {
            walkerMarker.setLatLng([lat, lng]);
          }
        }

        if (data.path && data.path.length > 0) {
          const latLngs = data.path.map((p) => [p.lat, p.lng]);
          if (!routePolyline) {
            routePolyline = L.polyline(latLngs, {
              color: "blue",
              weight: 4,
            }).addTo(map);
          } else {
            routePolyline.setLatLngs(latLngs);
          }

          // Calcular Distância Total
          let totalDist = 0;
          for (let i = 0; i < latLngs.length - 1; i++) {
            const p1 = L.latLng(latLngs[i]);
            const p2 = L.latLng(latLngs[i + 1]);
            totalDist += p1.distanceTo(p2);
          }
          const distEl = document.getElementById("distance-display");
          if (distEl) distEl.innerText = (totalDist / 1000).toFixed(2) + " km";
        }
      },
      (error) => {
        console.error("Erro no snapshot:", error);
        toastService.error("Erro de permissão ao carregar passeio.");
      }
    );
  },

  async unmount() {
    if (unsubscribe) unsubscribe();
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (chatInstance) chatInstance.destroy();
    if (timerInterval) clearInterval(timerInterval);
    if (map) {
      map.remove();
      map = null;
    }

    // Remove modal if exists (Auto-close on navigation)
    const modal = document.getElementById("payment-modal");
    if (modal) modal.parentElement.remove();

    walkerMarker = null;
    routePolyline = null;
    watchId = null;
    timerInterval = null;
    chatInstance = null;
  },
};
