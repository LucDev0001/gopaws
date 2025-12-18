import { walkService } from "../../services/walkService.js";
import { navigateTo } from "../../router/router.js";
import { toastService } from "../../utils/toastService.js";
import { WalkRequestCard } from "../../components/WalkRequestCard.js";
import { Wallet } from "../../components/Wallet.js";
import { dbService } from "../../services/dbService.js";
import { pwaService } from "../../services/pwaService.js";

export default {
  async render(container, user) {
    let unsubscribeRequests = null;

    // Audio Notificação
    const notifAudio = new Audio("./src/assets/sounds/notification.mp3");
    notifAudio.loop = true;

    // --- TELA DE ESPERA (PERFIL EM ANÁLISE) ---
    if (user.isVerified !== true) {
      container.className =
        "h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden";
      container.innerHTML = `
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div class="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full relative z-10 border border-gray-100">
            <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl animate-pulse">⏳</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Perfil em Análise</h2>
            <p class="text-gray-500 mb-8 leading-relaxed">Nossa equipe está verificando seus documentos. Isso garante a segurança de todos na plataforma.</p>
            
            <button onclick="window.location.reload()" class="w-full bg-yellow-100 text-yellow-800 font-bold py-3 rounded-xl hover:bg-yellow-200 transition flex items-center justify-center gap-2">
                <span>Verificar Status</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>
      `;
      return () => {};
    }

    // --- DASHBOARD ATIVO ---

    // Verificar Passeio Ativo
    let activeWalk = null;
    try {
      const allWalks = await dbService.getUserWalks(user.uid, "walker");
      activeWalk = allWalks.find((w) =>
        ["accepted", "ongoing"].includes(w.status)
      );
    } catch (e) {
      console.error(e);
    }

    const walletHtml = await Wallet.getHtml();

    // Layout Principal
    container.className =
      "h-full w-full bg-gray-50 overflow-y-auto overflow-x-hidden font-sans";
    container.innerHTML = `
        <div class="max-w-7xl mx-auto p-4 pb-24 md:p-8">
            
            <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div class="flex items-center gap-4">
                     <div onclick="window.location.hash='/profile/walker'" class="w-14 h-14 bg-white rounded-2xl overflow-hidden cursor-pointer border-2 border-green-500 shadow-sm p-1">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                          user.name
                        }" class="w-full h-full rounded-xl bg-gray-100" alt="Avatar">
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 leading-tight">Olá, ${
                          user.name.split(" ")[0]
                        }! 🌿</h1>
                        
                        <!-- Toggle Online/Offline -->
                        <div class="flex items-center gap-3 mt-2">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="toggle-online" class="sr-only peer" ${
                                  user.isActive !== false ? "checked" : ""
                                }>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                <span class="ml-2 text-sm font-medium text-gray-700" id="status-text">${
                                  user.isActive !== false ? "Online" : "Offline"
                                }</span>
                            </label>
                        </div>
                    </div>
                </div>
                <button id="btn-install-pwa-walker" class="hidden bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2">
                    📲 Instalar App
                </button>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        ${walletHtml}
                    </div>
                </div>

                <div class="lg:col-span-2 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>📍</span> Pedidos na Região
                        </h2>
                        <span class="text-xs font-bold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">GPS Ativo</span>
                    </div>

                    <div id="requests-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="col-span-1 md:col-span-2 py-12 text-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p class="text-gray-400">Buscando oportunidades próximas...</p>
                        </div>
                    </div>

                    <!-- Histórico Walker (Adicionado) -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
                        <h3 class="font-bold text-gray-800 mb-4">Histórico de Passeios</h3>
                        <div class="flex gap-2 mb-4">
                             <input type="text" id="w-history-filter" placeholder="Buscar pet..." class="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200">
                        </div>
                        <div id="walker-history-list" class="space-y-3"></div>
                        <div class="mt-4 text-center">
                            <button id="w-load-more" class="text-sm text-green-600 font-bold hover:underline">Carregar Mais</button>
                        </div>
                    </div>
                </div>
            </div>

            ${
              activeWalk
                ? `
            <div class="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
                <button onclick="window.location.hash='/walk?id=${activeWalk.id}'" class="bg-green-600 hover:bg-green-700 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl shadow-green-900/30 flex items-center gap-4 transition-all transform hover:scale-105 group border-4 border-white/20 backdrop-blur-sm">
                    <div class="bg-white/20 p-2 rounded-full">
                        <span class="text-2xl block animate-wiggle">🐕</span>
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] font-bold uppercase text-green-200 tracking-wider mb-0.5">Em Andamento</p>
                        <p class="text-base font-bold group-hover:underline">Voltar ao Mapa</p>
                    </div>
                </button>
            </div>
            `
                : ""
            }
        </div>
    `;

    // --- LÓGICA FUNCIONAL (Mantida Original) ---

    // Lógica Toggle Online/Offline
    const toggleBtn = document.getElementById("toggle-online");
    const statusText = document.getElementById("status-text");

    toggleBtn.addEventListener("change", async (e) => {
      const isOnline = e.target.checked;
      statusText.innerText = isOnline ? "Online" : "Offline";

      // Hack para desbloquear áudio no iOS/Android: Tocar e pausar imediatamente na interação do usuário
      if (isOnline) {
        notifAudio
          .play()
          .then(() => notifAudio.pause())
          .catch(() => {});
      }

      await dbService.toggleWalkerStatus(user.uid, isOnline);
      toastService.info(
        isOnline
          ? "Você está visível para novos pedidos."
          : "Você está invisível."
      );
    });

    window.acceptWalk = async (id) => {
      try {
        const walkId = await walkService.acceptRequest(id);
        navigateTo(`/walk?id=${walkId}`);
      } catch (err) {
        toastService.error(err.message);
      }
    };

    unsubscribeRequests = walkService.listenToOpenRequests(
      (requests) => {
        const list = document.getElementById("requests-list");
        if (!list) return;

        // Lógica de Som: Toca se houver pedidos E não estiver em passeio
        // E se o usuário estiver ONLINE
        if (requests.length > 0 && !activeWalk && toggleBtn.checked) {
          notifAudio.play().catch(() => {}); // Ignora erro de autoplay
        } else {
          notifAudio.pause();
          notifAudio.currentTime = 0;
        }

        if (requests.length === 0) {
          // Empty State bonito
          list.innerHTML = `
            <div class="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-white rounded-3xl p-10 border border-gray-100 border-dashed">
                <div class="text-4xl mb-4 grayscale opacity-50">📭</div>
                <p class="text-gray-500 font-medium">Nenhum pedido por perto.</p>
                <p class="text-sm text-gray-400 mt-1">Aguarde, novos pedidos aparecem automaticamente.</p>
            </div>`;
          return;
        }
        // A função WalkRequestCard deve retornar HTML. O Grid CSS já vai organizá-los.
        list.innerHTML = requests.map((req) => WalkRequestCard(req)).join("");
      },
      (error) => {
        console.error("Erro ao carregar pedidos:", error);
      }
    );

    // --- Lógica de Histórico Walker (Carregamento Inicial) ---
    const loadWalkerHistory = async () => {
      const walks = await dbService.getUserWalks(user.uid, "walker");
      const container = document.getElementById("walker-history-list");
      const filter = document.getElementById("w-history-filter");
      let limit = 5;

      const render = () => {
        const term = filter.value.toLowerCase();
        const filtered = walks.filter((w) =>
          (w.dogName || "").toLowerCase().includes(term)
        );
        const visible = filtered.slice(0, limit);

        container.innerHTML = visible
          .map(
            (w) => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p class="font-bold text-sm text-gray-800">${
                          w.dogName
                        }</p>
                        <p class="text-xs text-gray-500">${new Date(
                          w.createdAt.seconds * 1000
                        ).toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold ${
                          w.status === "completed"
                            ? "text-green-600"
                            : "text-orange-500"
                        }">${w.status}</span>
                        <button class="text-gray-400 hover:text-red-500" onclick="window.deleteWalk('${
                          w.id
                        }')">🗑️</button>
                    </div>
                </div>
            `
          )
          .join("");

        const btnMore = document.getElementById("w-load-more");
        if (limit >= filtered.length) btnMore.classList.add("hidden");
        else btnMore.classList.remove("hidden");
      };

      filter.addEventListener("input", render);
      document.getElementById("w-load-more").addEventListener("click", () => {
        limit += 5;
        render();
      });

      window.deleteWalk = async (id) => {
        const modal = document.createElement("div");
        modal.className =
          "fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in";
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                <h3 class="font-bold text-lg text-gray-900 mb-2">Ocultar Passeio?</h3>
                <p class="text-gray-500 text-sm mb-6">Este registro será removido da sua visualização de histórico.</p>
                <div class="flex gap-3">
                    <button id="btn-cancel-w-hist" class="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Cancelar</button>
                    <button id="btn-confirm-w-hist" class="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition">Ocultar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("btn-cancel-w-hist").onclick = () =>
          modal.remove();
        document.getElementById("btn-confirm-w-hist").onclick = async () => {
          modal.remove();
          await dbService.hideWalkHistory(id, "walker");
          const idx = walks.findIndex((w) => w.id === id);
          if (idx > -1) walks.splice(idx, 1);
          render();
          toastService.success("Histórico atualizado.");
        };
      };
      render();
    };
    loadWalkerHistory();

    // PWA Logic
    const installBtn = document.getElementById("btn-install-pwa-walker");

    const cleanupPwa = pwaService.onInstallable(() => {
      installBtn.classList.remove("hidden");
    });

    installBtn.addEventListener("click", async () => {
      const installed = await pwaService.promptInstall();
      if (installed) installBtn.classList.add("hidden");
    });

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
      window.acceptWalk = null;
      window.deleteWalk = null;
      notifAudio.pause();
      cleanupPwa();
    };
  },
};
