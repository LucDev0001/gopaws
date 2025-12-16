import { walkService } from "../../services/walkService.js";
import { navigateTo } from "../../router/router.js";
import { toastService } from "../../utils/toastService.js";
import { WalkRequestCard } from "../../components/WalkRequestCard.js";
import { Wallet } from "../../components/Wallet.js";
import { dbService } from "../../services/dbService.js";

export default {
  async render(container, user) {
    let unsubscribeRequests = null;

    if (user.isVerified !== true) {
      container.className =
        "h-full w-full bg-gray-50 flex flex-col items-center justify-center p-6 text-center";
      container.innerHTML = `
                <div class="bg-yellow-100 p-4 rounded-full mb-4 text-4xl">⏳</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">Perfil em Análise</h2>
                <p class="text-gray-600 mb-6">Seus documentos estão sendo verificados. Você será notificado em breve.</p>
                <button onclick="window.location.reload()" class="text-blue-600 font-medium hover:underline">Verificar novamente</button>
            `;
      return () => {};
    }

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

    container.className = "h-full w-full bg-gray-50 p-4 overflow-y-auto pb-20";
    container.innerHTML = `
            <header class="flex justify-between items-center mb-6 mt-2">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Olá, ${
                      user.name.split(" ")[0]
                    } 👋</h1>
                    <p class="text-green-600 font-medium text-sm">● Online e disponível</p>
                </div>
                <div onclick="window.location.hash='/profile'" class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden cursor-pointer border-2 border-white shadow-sm">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      user.name
                    }" alt="Avatar">
                </div>
            </header>

            ${walletHtml}

            <h2 class="text-lg font-bold text-gray-700 mb-4">Pedidos Próximos</h2>
            <div id="requests-list" class="space-y-4">
                <p class="text-center text-gray-400 py-10">Procurando passeios...</p>
            </div>

            <!-- Botão Flutuante de Passeio Ativo -->
            ${
              activeWalk
                ? `
            <button onclick="window.location.hash='/walk?id=${activeWalk.id}'" class="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 hover:bg-green-700 transition transform hover:scale-105 animate-fade-in">
                <span class="text-2xl animate-pulse">🐕</span>
                <div class="text-left leading-tight">
                    <p class="text-[10px] font-bold uppercase text-green-200 tracking-wider">Em Andamento</p>
                    <p class="text-sm font-bold">Voltar ao Mapa</p>
                </div>
            </button>
            `
                : ""
            }
        `;

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
          list.innerHTML =
            '<p class="text-center text-gray-400 py-10">Nenhum pedido no momento.</p>';
          return;
        }
        list.innerHTML = requests.map((req) => WalkRequestCard(req)).join("");
      },
      (error) => {
        console.error("Erro ao carregar pedidos:", error);
        // Opcional: toastService.error("Erro de conexão com pedidos.");
      }
    );

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
      window.acceptWalk = null;
    };
  },
};
