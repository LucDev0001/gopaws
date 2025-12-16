import { dbService } from "../services/dbService.js";
import { toastService } from "../utils/toastService.js";
import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";
import { db } from "../services/firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Pet Shops</p>
                    <p class="text-3xl font-bold mt-2" id="count-managers">...</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Walkers</p>
                    <p class="text-3xl font-bold mt-2" id="count-walkers">...</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Tutores</p>
                    <p class="text-3xl font-bold mt-2" id="count-tutors">...</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
                    <div class="relative z-10">
                        <p class="text-gray-400 text-xs font-bold uppercase">Total Passeios</p>
                        <p class="text-3xl font-bold mt-2" id="count-walks">...</p>
                    </div>
                    <div class="absolute right-0 bottom-0 text-6xl opacity-10">🐕</div>
                </div>
                <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <p class="text-gray-400 text-xs font-bold uppercase">Receita Mensal</p>
                    <p class="text-3xl font-bold mt-2 text-green-400" id="count-revenue">R$ 0,00</p>
                </div>
            </div>

            <!-- Growth Chart -->
            <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg mb-8">
                <h3 class="text-gray-400 text-xs font-bold uppercase mb-4">Crescimento de Usuários (Acumulado - 6 Meses)</h3>
                <div id="growth-chart-container" class="w-full h-64">
                    <div class="h-full flex items-center justify-center text-gray-500">Carregando gráfico...</div>
                </div>
            </div>

            <!-- Ferramentas (Busca) -->
            <div class="mb-8 flex flex-col md:flex-row gap-4">
                <div class="relative flex-1">
                    <input type="text" id="search-input" placeholder="Buscar por nome, email ou CNPJ..." 
                        class="w-full bg-gray-800 border border-gray-700 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm placeholder-gray-500">
                    <span class="absolute right-5 top-4 text-gray-500">🔍</span>
                </div>
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-1 flex overflow-x-auto">
                    <button class="tab-btn flex-1 px-6 py-3 rounded-lg text-sm font-bold transition bg-gray-700 text-white shadow-sm whitespace-nowrap" data-target="managers">🏢 Pet Shops</button>
                    <button class="tab-btn flex-1 px-6 py-3 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition whitespace-nowrap" data-target="walkers">🚶 Walkers</button>
                    <button class="tab-btn flex-1 px-6 py-3 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition whitespace-nowrap" data-target="tutors">🐕 Tutores</button>
                    <button class="tab-btn flex-1 px-6 py-3 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition whitespace-nowrap" data-target="subscriptions">💰 Assinaturas</button>
                </div>
            </div>

            <!-- Lista Dinâmica -->
            <div class="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 flex flex-col h-[600px]">
                <div class="p-6 border-b border-gray-700 bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm rounded-t-2xl flex justify-between items-center">
                    <h2 class="font-bold text-lg flex items-center gap-2" id="list-title">🏢 Pet Shops</h2>
                    <span id="list-badge" class="bg-gray-700 text-xs px-2 py-1 rounded-full font-mono">0</span>
                </div>
                <div id="users-list" class="divide-y divide-gray-700 overflow-y-auto flex-1 custom-scrollbar">
                    <div class="p-6 text-center text-gray-400">Carregando...</div>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  async init() {
    const listContainer = document.getElementById("users-list");
    const searchInput = document.getElementById("search-input");
    const btnLogout = document.getElementById("btn-logout-admin");
    const listTitle = document.getElementById("list-title");
    const listBadge = document.getElementById("list-badge");
    const tabBtns = document.querySelectorAll(".tab-btn");

    // Logout Logic
    btnLogout.addEventListener("click", async () => {
      if (confirm("Sair do painel admin?")) {
        await authService.logout();
        navigateTo("/login");
      }
    });

    let allManagers = [];
    let allWalkers = [];
    let allTutors = [];
    let currentTab = "managers";

    const renderCurrentList = () => {
      const term = searchInput.value.toLowerCase();
      let sourceData = [];
      let title = "";
      let icon = "";

      if (currentTab === "managers") {
        sourceData = allManagers;
        title = "Pet Shops";
        icon = "🏢";
      } else if (currentTab === "walkers") {
        sourceData = allWalkers;
        title = "Walkers";
        icon = "🚶";
      } else if (currentTab === "subscriptions") {
        sourceData = allManagers;
        title = "Gestão de Assinaturas";
        icon = "💳";
      } else {
        sourceData = allTutors;
        title = "Tutores";
        icon = "🐕";
      }

      listTitle.innerHTML = `${icon} ${title}`;

      const filtered = sourceData.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term)) ||
          (u.cnpj && u.cnpj.includes(term))
      );

      listBadge.innerText = filtered.length;
      renderContainer(listContainer, filtered, currentTab);
    };

    const renderGrowthChart = (users) => {
      const container = document.getElementById("growth-chart-container");
      if (!container) return;

      // 1. Prepare Data Buckets (Last 6 months)
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
          date: d,
          label: d.toLocaleString("default", { month: "short" }),
          count: 0,
        });
      }

      // 2. Count Users (Cumulative)
      let runningTotal = 0;
      const firstMonthStart = months[0].date;

      // Count users before the window
      users.forEach((u) => {
        if (u.createdAt) {
          const date = u.createdAt.toDate
            ? u.createdAt.toDate()
            : new Date(u.createdAt);
          if (date < firstMonthStart) runningTotal++;
        }
      });

      // Count users in buckets
      users.forEach((u) => {
        if (u.createdAt) {
          const date = u.createdAt.toDate
            ? u.createdAt.toDate()
            : new Date(u.createdAt);
          const bucket = months.find(
            (m) =>
              m.date.getMonth() === date.getMonth() &&
              m.date.getFullYear() === date.getFullYear()
          );
          if (bucket) bucket.count++;
        }
      });

      const dataPoints = months.map((m) => {
        runningTotal += m.count;
        return { label: m.label, value: runningTotal };
      });

      // 3. Generate SVG
      const width = 800;
      const height = 200;
      const padding = 40;
      const maxValue = Math.max(...dataPoints.map((d) => d.value)) || 10;

      const getX = (index) =>
        padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
      const getY = (value) =>
        height - padding - (value / (maxValue * 1.1)) * (height - 2 * padding);

      let pathD = `M ${getX(0)} ${getY(dataPoints[0].value)}`;
      dataPoints.forEach((d, i) => (pathD += ` L ${getX(i)} ${getY(d.value)}`));
      const areaD = `${pathD} L ${getX(dataPoints.length - 1)} ${
        height - padding
      } L ${getX(0)} ${height - padding} Z`;

      const circles = dataPoints
        .map(
          (d, i) =>
            `<circle cx="${getX(i)}" cy="${getY(
              d.value
            )}" r="4" fill="#3B82F6" stroke="white" stroke-width="2" />
             <text x="${getX(i)}" y="${
              getY(d.value) - 15
            }" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${
              d.value
            }</text>
             <text x="${getX(i)}" y="${
              height - 10
            }" text-anchor="middle" fill="#9CA3AF" font-size="12">${
              d.label
            }</text>`
        )
        .join("");

      container.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="w-full h-full">
                <line x1="${padding}" y1="${height - padding}" x2="${
        width - padding
      }" y2="${height - padding}" stroke="#374151" stroke-width="1" />
                <path d="${areaD}" fill="rgba(59, 130, 246, 0.2)" />
                <path d="${pathD}" fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                ${circles}
            </svg>
        `;
    };

    // Tab Switching
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentTab = btn.dataset.target;
        tabBtns.forEach((b) =>
          b.classList.replace("bg-gray-700", "text-gray-400")
        );
        tabBtns.forEach((b) =>
          b.classList.replace("text-white", "hover:text-white")
        );

        btn.classList.remove("text-gray-400", "hover:text-white");
        btn.classList.add("bg-gray-700", "text-white");

        renderCurrentList();
      });
    });

    const renderContainer = (container, users, type) => {
      if (users.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500 flex flex-col items-center"><span class="text-2xl mb-2">🔍</span><p>Nenhum usuário encontrado.</p></div>`;
        return;
      }

      container.innerHTML = users
        .map((user) => {
          const isPaid = user.isSubscriptionPaid === true;
          const isBanned = user.isBanned === true;
          const isVerified = user.isVerified === true;

          let statusBadge = "";
          if (type === "managers") {
            statusBadge = isPaid
              ? `<span class="text-[10px] bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-800">Assinatura Ativa</span>`
              : `<span class="text-[10px] bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full border border-yellow-800">Pagamento Pendente</span>`;
          } else if (type === "walkers") {
            statusBadge = isVerified
              ? `<span class="text-[10px] bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-800">Verificado</span>`
              : `<span class="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded-full border border-gray-600">Não Verificado</span>`;
          } else if (type === "subscriptions") {
            // Lógica de Vencimento
            const expiresAt = user.subscriptionExpiresAt;
            let daysLeft = null;
            let dateStr = "---";

            if (expiresAt) {
              const date = expiresAt.toDate
                ? expiresAt.toDate()
                : new Date(expiresAt);
              dateStr = date.toLocaleDateString("pt-BR");
              const now = new Date();
              const diff = date - now;
              daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
            }

            if (isPaid) {
              if (daysLeft !== null) {
                if (daysLeft < 0) {
                  statusBadge = `<span class="text-[10px] bg-red-900 text-red-300 px-2 py-1 rounded-full border border-red-800">Vencido há ${Math.abs(
                    daysLeft
                  )} dias</span>`;
                } else if (daysLeft <= 5) {
                  statusBadge = `<span class="text-[10px] bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full border border-yellow-800">Vence em ${daysLeft} dias</span>`;
                } else {
                  statusBadge = `<span class="text-[10px] bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-800">Vence em ${daysLeft} dias</span>`;
                }
              } else {
                statusBadge = `<span class="text-[10px] bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-800">Ativo (Sem data)</span>`;
              }
            } else {
              statusBadge = `<span class="text-[10px] bg-gray-700 text-gray-400 px-2 py-1 rounded-full border border-gray-600">Inativo</span>`;
            }

            return `
                <div class="p-4 hover:bg-gray-700/30 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg border border-gray-600">🏢</div>
                        <div>
                            <p class="font-bold text-white text-sm">${user.name}</p>
                            <div class="flex items-center gap-2 mt-1">${statusBadge}</div>
                            <p class="text-[10px] text-gray-500 mt-0.5">Vencimento: ${dateStr}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button data-id="${user.id}" class="btn-renew bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition">Renovar (+30d)</button>
                        <button data-id="${user.id}" class="btn-revoke bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 text-xs font-bold px-3 py-1.5 rounded transition">Cancelar</button>
                    </div>
                </div>
             `;
          }

          return `
            <div class="p-4 hover:bg-gray-700/30 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isBanned ? "opacity-50 grayscale" : ""
            }">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg border border-gray-600">
                        ${
                          type === "managers"
                            ? "🏢"
                            : type === "walkers"
                            ? "🚶"
                            : "🐕"
                        }
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm flex items-center gap-2">
                            ${user.name} 
                            ${
                              isBanned
                                ? '<span class="text-red-500 text-[10px] border border-red-500 px-1 rounded">BANIDO</span>'
                                : ""
                            }
                        </p>
                        <p class="text-xs text-gray-400">${user.email}</p>
                        ${
                          user.cnpj
                            ? `<p class="text-[10px] text-gray-500 font-mono mt-0.5">CNPJ: ${user.cnpj}</p>`
                            : ""
                        }
                        ${
                          user.phone
                            ? `<p class="text-[10px] text-gray-500 font-mono mt-0.5">Tel: ${user.phone}</p>`
                            : ""
                        }
                    </div>
                </div>
                
                <div class="flex items-center gap-3 self-end sm:self-center">
                    ${statusBadge}
                    
                    <div class="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    ${
                      type === "managers" && !isPaid
                        ? `<button data-id="${user.id}" class="btn-approve bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition">Aprovar</button>`
                        : ""
                    }
                    ${
                      !isBanned
                        ? `<button data-id="${user.id}" class="btn-ban bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 text-xs font-bold px-3 py-1.5 rounded transition">Banir</button>`
                        : `<button data-id="${user.id}" class="btn-unban bg-green-900/50 hover:bg-green-600 text-green-200 hover:text-white border border-green-800 text-xs font-bold px-3 py-1.5 rounded transition">Reativar</button>`
                    }
                    </div>
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

              const now = new Date();
              const nextMonth = new Date(now.setDate(now.getDate() + 30));

              await updateDoc(doc(db, "users", uid), {
                isSubscriptionPaid: true,
                subscriptionExpiresAt: Timestamp.fromDate(nextMonth),
              });

              toastService.success("Aprovado!");
              // Refresh data locally
              const user = allManagers.find((u) => u.id === uid);
              if (user) user.isSubscriptionPaid = true;
              if (user) {
                user.isSubscriptionPaid = true;
                user.subscriptionExpiresAt = Timestamp.fromDate(nextMonth);
              }
              renderCurrentList();
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
              const tUser = allTutors.find((u) => u.id === uid);
              if (mUser) mUser.isBanned = true;
              if (wUser) wUser.isBanned = true;
              if (tUser) tUser.isBanned = true;
              renderCurrentList();
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });

      container.querySelectorAll(".btn-unban").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.target.dataset.id;
          if (confirm("Reativar usuário?")) {
            try {
              await dbService.updateUser(uid, { isBanned: false });
              toastService.success("Usuário reativado!");
              const mUser = allManagers.find((u) => u.id === uid);
              const wUser = allWalkers.find((u) => u.id === uid);
              const tUser = allTutors.find((u) => u.id === uid);
              if (mUser) mUser.isBanned = false;
              if (wUser) wUser.isBanned = false;
              if (tUser) tUser.isBanned = false;
              renderCurrentList();
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });

      // Subscription Listeners
      container.querySelectorAll(".btn-renew").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.target.dataset.id;
          if (confirm("Renovar assinatura por 30 dias?")) {
            try {
              const now = new Date();
              const nextMonth = new Date(now.setDate(now.getDate() + 30));
              await updateDoc(doc(db, "users", uid), {
                isSubscriptionPaid: true,
                subscriptionExpiresAt: Timestamp.fromDate(nextMonth),
              });

              // Update local state
              const mgr = allManagers.find((u) => u.id === uid);
              if (mgr) {
                mgr.isSubscriptionPaid = true;
                mgr.subscriptionExpiresAt = Timestamp.fromDate(nextMonth);
              }

              // Update Revenue Display
              const activeCount = allManagers.filter(
                (m) => m.isSubscriptionPaid
              ).length;
              document.getElementById("count-revenue").innerText = `R$ ${(
                activeCount * 100
              ).toLocaleString("pt-BR")},00`;

              renderCurrentList();
              toastService.success("Assinatura renovada!");
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });

      container.querySelectorAll(".btn-revoke").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.target.dataset.id;
          if (
            confirm("Cancelar assinatura? O usuário perderá acesso ao painel.")
          ) {
            try {
              await updateDoc(doc(db, "users", uid), {
                isSubscriptionPaid: false,
              });

              const mgr = allManagers.find((u) => u.id === uid);
              if (mgr) mgr.isSubscriptionPaid = false;

              const activeCount = allManagers.filter(
                (m) => m.isSubscriptionPaid
              ).length;
              document.getElementById("count-revenue").innerText = `R$ ${(
                activeCount * 100
              ).toLocaleString("pt-BR")},00`;

              renderCurrentList();
              toastService.success("Assinatura cancelada.");
            } catch (err) {
              toastService.error(err.message);
            }
          }
        });
      });
    };

    try {
      const walksSnap = await getDocs(collection(db, "walks"));
      document.getElementById("count-walks").innerText = walksSnap.size;

      [allManagers, allWalkers, allTutors] = await Promise.all([
        dbService.getUsersByRole("manager"),
        dbService.getUsersByRole("walker"),
        dbService.getUsersByRole("tutor"),
      ]);

      document.getElementById("count-managers").innerText = allManagers.length;
      document.getElementById("count-walkers").innerText = allWalkers.length;
      document.getElementById("count-tutors").innerText = allTutors.length;

      // Calculate Revenue (Active Managers * 100)
      const activeManagers = allManagers.filter(
        (m) => m.isSubscriptionPaid
      ).length;
      document.getElementById("count-revenue").innerText = `R$ ${(
        activeManagers * 100
      ).toLocaleString("pt-BR")},00`;

      const allUsers = [...allManagers, ...allWalkers, ...allTutors];
      renderGrowthChart(allUsers);

      renderCurrentList();
    } catch (error) {
      console.error("Erro ao carregar managers:", error);
      toastService.error("Erro ao carregar dados.");
    }

    // Search Event
    searchInput.addEventListener("input", (e) => renderCurrentList());
  },
};
