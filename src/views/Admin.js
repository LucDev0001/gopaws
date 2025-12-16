import { dbService } from "../services/dbService.js";
import { toastService } from "../utils/toastService.js";
import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
      <div class="min-h-screen bg-gray-900 text-white flex flex-col">
        <!-- Header -->
        <header class="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center sticky top-0 z-10 shadow-md">
            <div>
                <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
                    🛡️ Painel Admin
                </h1>
                <p class="text-gray-400 text-sm">Gerenciamento do Sistema GoPaws</p>
            </div>
            <button id="btn-logout-admin" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm shadow-lg">
                <span>🚪</span> Sair
            </button>
        </header>

        <div class="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Pet Shops</p>
                    <p class="text-3xl font-bold mt-2" id="count-managers">...</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Walkers</p>
                    <p class="text-3xl font-bold mt-2" id="count-walkers">...</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Total Usuários</p>
                    <p class="text-3xl font-bold mt-2" id="count-total">...</p>
                </div>
            </div>

            <!-- Ferramentas (Busca) -->
            <div class="mb-8">
                <div class="relative">
                    <input type="text" id="search-input" placeholder="Buscar por nome, email ou CNPJ..." 
                        class="w-full bg-gray-800 border border-gray-700 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm placeholder-gray-500">
                    <span class="absolute right-5 top-4 text-gray-500">🔍</span>
                </div>
            </div>

            <!-- Listas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Pet Shops -->
                <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 flex flex-col h-[600px]">
                    <div class="p-6 border-b border-gray-700 bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm rounded-t-2xl flex justify-between items-center">
                        <h2 class="font-bold text-lg flex items-center gap-2">🏢 Pet Shops</h2>
                        <span id="badge-managers" class="bg-gray-700 text-xs px-2 py-1 rounded-full font-mono">0</span>
                    </div>
                    <div id="managers-list" class="divide-y divide-gray-700 overflow-y-auto flex-1 custom-scrollbar">
                        <div class="p-6 text-center text-gray-400">Carregando...</div>
                    </div>
                </div>

                <!-- Walkers -->
                <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 flex flex-col h-[600px]">
                    <div class="p-6 border-b border-gray-700 bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm rounded-t-2xl flex justify-between items-center">
                        <h2 class="font-bold text-lg flex items-center gap-2">🚶 Walkers</h2>
                        <span id="badge-walkers" class="bg-gray-700 text-xs px-2 py-1 rounded-full font-mono">0</span>
                    </div>
                    <div id="walkers-list" class="divide-y divide-gray-700 overflow-y-auto flex-1 custom-scrollbar">
                        <div class="p-6 text-center text-gray-400">Carregando...</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  async init() {
    const listContainerManagers = document.getElementById("managers-list");
    const listContainerWalkers = document.getElementById("walkers-list");
    const searchInput = document.getElementById("search-input");
    const btnLogout = document.getElementById("btn-logout-admin");

    // Logout Logic
    btnLogout.addEventListener("click", async () => {
      if (confirm("Sair do painel admin?")) {
        await authService.logout();
        navigateTo("/login");
      }
    });

    let allManagers = [];
    let allWalkers = [];

    const renderLists = (filterText = "") => {
      const term = filterText.toLowerCase();

      const filteredManagers = allManagers.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.cnpj && u.cnpj.includes(term))
      );

      const filteredWalkers = allWalkers.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );

      // Update Counts
      document.getElementById("count-managers").innerText = allManagers.length;
      document.getElementById("count-walkers").innerText = allWalkers.length;
      document.getElementById("count-total").innerText =
        allManagers.length + allWalkers.length;
      document.getElementById("badge-managers").innerText =
        filteredManagers.length;
      document.getElementById("badge-walkers").innerText =
        filteredWalkers.length;

      renderContainer(listContainerManagers, filteredManagers, true);
      renderContainer(listContainerWalkers, filteredWalkers, false);
    };

    const renderContainer = (container, users, isManagerList) => {
      if (users.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500 flex flex-col items-center"><span class="text-2xl mb-2">🔍</span><p>Nenhum usuário encontrado.</p></div>`;
        return;
      }

      container.innerHTML = users
        .map((user) => {
          const isPaid = user.isSubscriptionPaid === true;
          const isBanned = user.isBanned === true;

          return `
            <div class="p-4 hover:bg-gray-700/30 transition group ${
              isBanned ? "opacity-50 grayscale" : ""
            }">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-bold text-white text-sm">${user.name} ${
            isBanned
              ? '<span class="text-red-500 text-[10px] border border-red-500 px-1 rounded ml-1">BANIDO</span>'
              : ""
          }</p>
                        <p class="text-xs text-gray-400">${user.email}</p>
                        ${
                          isManagerList && user.cnpj
                            ? `<p class="text-[10px] text-gray-500 font-mono mt-1">CNPJ: ${user.cnpj}</p>`
                            : ""
                        }
                    </div>
                    ${
                      isManagerList
                        ? isPaid
                          ? `<span class="text-[10px] bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-800">Ativo</span>`
                          : `<span class="text-[10px] bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full border border-yellow-800">Pendente</span>`
                        : ""
                    }
                </div>
                
                <div class="flex gap-2 mt-3 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                    ${
                      isManagerList && !isPaid
                        ? `<button data-id="${user.id}" class="btn-approve flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition">Aprovar</button>`
                        : ""
                    }
                    ${
                      !isBanned
                        ? `<button data-id="${user.id}" class="btn-ban flex-1 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 text-xs font-bold py-2 rounded transition">Banir</button>`
                        : ""
                    }
                </div>
            </div>
          `;
        })
        .join("");

      // Re-attach listeners
      attachListeners(container);
    };

    const attachListeners = (container) => {
      container.querySelectorAll(".btn-approve").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.target.dataset.id;
          if (confirm("Aprovar assinatura?")) {
            try {
              e.target.innerText = "...";
              await dbService.approveSubscription(uid);
              toastService.success("Aprovado!");
              // Refresh data locally
              const user = allManagers.find((u) => u.id === uid);
              if (user) user.isSubscriptionPaid = true;
              renderLists(searchInput.value);
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });

      container.querySelectorAll(".btn-ban").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.target.dataset.id;
          if (confirm("Banir usuário?")) {
            try {
              await dbService.banUser(uid);
              toastService.success("Banido!");
              // Refresh data locally
              const mUser = allManagers.find((u) => u.id === uid);
              const wUser = allWalkers.find((u) => u.id === uid);
              if (mUser) mUser.isBanned = true;
              if (wUser) wUser.isBanned = true;
              renderLists(searchInput.value);
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });
    };

    try {
      [allManagers, allWalkers] = await Promise.all([
        dbService.getUsersByRole("manager"),
        dbService.getUsersByRole("walker"),
      ]);
      renderLists();
    } catch (error) {
      console.error("Erro ao carregar managers:", error);
      toastService.error("Erro ao carregar dados.");
    }

    // Search Event
    searchInput.addEventListener("input", (e) => renderLists(e.target.value));
  },
};
