import { walkService } from "../../services/walkService.js";
import { navigateTo } from "../../router/router.js";
import { toastService } from "../../utils/toastService.js";
import { WalkRequestCard } from "../../components/WalkRequestCard.js";
import { Wallet } from "../../components/Wallet.js";
import { dbService } from "../../services/dbService.js";

export default {
  async render(container, user) {
    let unsubscribeRequests = null;

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
                        <div class="flex items-center gap-2 mt-1">
                            <span class="relative flex h-3 w-3">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <p class="text-gray-500 font-medium text-sm">Disponível para passeios</p>
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

    // PWA Logic
    const installBtn = document.getElementById("btn-install-pwa-walker");
    if (window.deferredPrompt) {
      installBtn.classList.remove("hidden");
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      installBtn.classList.remove("hidden");
    });
    installBtn.addEventListener("click", async () => {
      if (!window.deferredPrompt) return;
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === "accepted") installBtn.classList.add("hidden");
      window.deferredPrompt = null;
    });

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
      window.acceptWalk = null;
    };
  },
};
