import { db, firebaseConfig } from "../../services/firebase.js";
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { toastService } from "../../utils/toastService.js";

// --- Funções Auxiliares de Máscara ---
const maskCPF = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const maskPhone = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

export default {
  async render(container, user) {
    let unsubscribeListeners = [];

    // --- Layout Base (Sidebar + Main Content) ---
    container.className = "flex h-full w-full bg-gray-50 overflow-hidden";
    container.innerHTML = `
      <!-- Sidebar (Desktop) -->
      <aside class="w-64 bg-gray-900 text-white flex-col hidden md:flex shadow-xl z-20">
        <div class="p-6 flex items-center gap-3 border-b border-gray-800">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">G</div>
          <span class="font-bold text-xl tracking-tight">GoPaws Admin</span>
        </div>
        
        <nav class="flex-1 px-4 space-y-2 mt-6">
          <button data-tab="dashboard" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group">
            <span class="group-hover:scale-110 transition-transform">📊</span> <span class="font-medium">Dashboard</span>
          </button>
          <button data-tab="team" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group">
            <span class="group-hover:scale-110 transition-transform">👥</span> <span class="font-medium">Equipe</span>
          </button>
          <button data-tab="billing" class="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group">
            <span class="group-hover:scale-110 transition-transform">💲</span> <span class="font-medium">Assinatura</span>
          </button>
        </nav>

        <div class="p-4 border-t border-gray-800 bg-gray-900/50">
          <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onclick="window.location.hash='/profile'">
             <div class="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}" class="w-full h-full object-cover" />
             </div>
             <div class="overflow-hidden">
               <p class="text-sm font-bold text-white truncate">${user.name}</p>
               <p class="text-xs text-gray-500 truncate">Gerente</p>
             </div>
          </div>
        </div>
      </aside>

      <!-- Mobile Header -->
      <div class="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white z-50 p-4 flex justify-between items-center shadow-md">
         <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs">G</div>
            <span class="font-bold">GoPaws Admin</span>
         </div>
         <div class="flex gap-4 text-sm">
            <button data-tab="dashboard" class="nav-item-mobile opacity-70 text-xl">📊</button>
            <button data-tab="team" class="nav-item-mobile opacity-70 text-xl">👥</button>
            <button data-tab="billing" class="nav-item-mobile opacity-70 text-xl">💲</button>
         </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative pt-16 md:pt-0" id="main-content">
        <!-- Dynamic Content -->
      </main>
    `;

    const mainContent = document.getElementById("main-content");

    // --- Renderers (Funções de Renderização das Abas) ---

    const renderDashboard = async () => {
      // Subscription Check
      if (user.isSubscriptionPaid !== true) {
        mainContent.innerHTML = `
                <div class="p-8 text-center">
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg max-w-md mx-auto">
                        <h3 class="font-bold text-lg">Assinatura Pendente</h3>
                        <p class="text-sm mt-2">Sua assinatura mensal está pendente. Por favor, realize o pagamento na aba 'Assinatura' para liberar o acesso ao painel.</p>
                    </div>
                </div>`;
        return;
      }

      mainContent.innerHTML = `
            <div class="p-8 max-w-7xl mx-auto animate-fade-in">
                <header class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Visão Geral</h2>
                    <p class="text-gray-500">Acompanhe o desempenho da sua agência.</p>
                </header>

                <!-- KPIs -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
                            <h3 class="text-3xl font-bold text-gray-900 mt-1" id="kpi-revenue">R$ ...</h3>
                        </div>
                        <div class="mt-4 text-green-500 text-sm font-medium flex items-center gap-1">
                            <span>↗</span> <span id="kpi-revenue-growth">Calculando...</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Passeios Realizados</p>
                            <h3 class="text-3xl font-bold text-gray-900 mt-1" id="kpi-walks">...</h3>
                        </div>
                        <div class="mt-4 text-blue-500 text-sm font-medium">
                            Total acumulado
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                        <div class="relative z-10">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Equipe Ativa</p>
                            <h3 class="text-3xl font-bold mt-1" id="kpi-team">...</h3>
                        </div>
                        <div class="absolute right-0 bottom-0 opacity-10 text-8xl transform translate-x-4 translate-y-4">👥</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Top Walkers -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>🏆</span> Top Performance
                        </h3>
                        <div id="top-walkers-list" class="space-y-4">
                            <p class="text-gray-400 text-sm">Carregando dados...</p>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>🕒</span> Atividade Recente
                        </h3>
                        <div id="recent-activity-list" class="space-y-4">
                            <p class="text-gray-400 text-sm">Carregando dados...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

      // Fetch Data Logic
      const qWalks = query(
        collection(db, "walks"),
        where("managerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const qTeam = query(
        collection(db, "users"),
        where("managerId", "==", user.uid),
        where("role", "==", "walker")
      );

      // Listen to Walks
      const unsubWalks = onSnapshot(qWalks, {
        next: (snap) => {
          let totalRevenue = 0;
          let walksCount = snap.size;
          let walkerStats = {}; // { walkerId: { name, count, totalRating, ratingCount } }
          let recentHtml = "";

          snap.docs.forEach((doc, index) => {
            const data = doc.data();

            // Revenue
            if (data.price) totalRevenue += Number(data.price);

            // Walker Stats
            if (data.walkerId) {
              if (!walkerStats[data.walkerId]) {
                walkerStats[data.walkerId] = {
                  name: data.walkerName || "Unknown",
                  count: 0,
                  totalRating: 0,
                  ratingCount: 0,
                };
              }
              walkerStats[data.walkerId].count++;
              if (data.rating) {
                walkerStats[data.walkerId].totalRating += data.rating;
                walkerStats[data.walkerId].ratingCount++;
              }
            }

            // Recent Activity (Top 5)
            if (index < 5) {
              const date = data.createdAt
                ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                : "";
              const statusColor =
                data.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700";
              recentHtml += `
                        <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">🐕</div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">${
                                      data.dogName || "Pet"
                                    }</p>
                                    <p class="text-xs text-gray-500">Walker: ${
                                      data.walkerName || "..."
                                    }</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-bold px-2 py-1 rounded-full ${statusColor}">${
                data.status
              }</span>
                                <p class="text-xs text-gray-400 mt-1">${date}</p>
                            </div>
                        </div>
                    `;
            }
          });

          // Update KPIs
          const revEl = document.getElementById("kpi-revenue");
          if (revEl)
            revEl.innerText = totalRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

          const growthEl = document.getElementById("kpi-revenue-growth");
          if (growthEl) growthEl.innerText = `${walksCount} passeios totais`;

          const walksEl = document.getElementById("kpi-walks");
          if (walksEl) walksEl.innerText = walksCount;

          const recentContainer = document.getElementById(
            "recent-activity-list"
          );
          if (recentContainer)
            recentContainer.innerHTML =
              recentHtml ||
              '<p class="text-gray-400 text-sm">Nenhuma atividade recente.</p>';

          // Process Top Walkers
          const walkersArray = Object.values(walkerStats).map((w) => ({
            ...w,
            avgRating: w.ratingCount > 0 ? w.totalRating / w.ratingCount : 0,
          }));

          // Sort by Rating then Count
          walkersArray.sort(
            (a, b) => b.avgRating - a.avgRating || b.count - a.count
          );

          const topWalkersHtml = walkersArray
            .slice(0, 3)
            .map(
              (w, i) => `
                <div class="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
                    <div class="font-bold text-gray-300 text-xl">#${i + 1}</div>
                    <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                          w.name
                        }" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-gray-800 text-sm">${w.name}</p>
                        <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span>${w.count} passeios</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-yellow-500 flex items-center gap-1">
                            <span>⭐</span> ${w.avgRating.toFixed(1)}
                        </div>
                    </div>
                </div>
            `
            )
            .join("");

          const topContainer = document.getElementById("top-walkers-list");
          if (topContainer)
            topContainer.innerHTML =
              topWalkersHtml ||
              '<p class="text-gray-400 text-sm">Sem dados suficientes.</p>';
        },
        error: (error) => {
          console.error("Erro ao carregar passeios:", error);
          toastService.error("Erro ao carregar dados de passeios.");
        },
      });

      // Listen to Team Count
      const unsubTeam = onSnapshot(qTeam, (snap) => {
        const el = document.getElementById("kpi-team");
        if (el) el.innerText = snap.size;
      });

      unsubscribeListeners.push(unsubWalks, unsubTeam);
    };

    const renderTeam = async () => {
      mainContent.innerHTML = `
            <div class="p-8 max-w-5xl mx-auto animate-fade-in">
                <header class="mb-8 flex justify-between items-end">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900">Gestão de Equipe</h2>
                        <p class="text-gray-500">Adicione e gerencie seus profissionais.</p>
                    </div>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Form -->
                    <div class="lg:col-span-1">
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 class="font-bold text-gray-800 mb-4">Novo Walker</h3>
                            <form id="form-add-walker" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nome</label>
                                    <input type="text" id="w-name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none" required>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                                    <input type="email" id="w-email" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none" required>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">CPF</label>
                                        <input type="text" id="w-cpf" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none" required>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tel</label>
                                        <input type="tel" id="w-phone" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none" required>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                                    <input type="text" id="w-password" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none" placeholder="Min 6 chars" required>
                                </div>
                                <button type="submit" id="btn-create-walker" class="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                                    + Cadastrar
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- List -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 class="font-bold text-gray-800">Membros da Equipe</h3>
                                <span class="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600" id="team-count-badge">0</span>
                            </div>
                            <div id="authorized-list" class="divide-y divide-gray-100">
                                <p class="p-8 text-center text-gray-400">Carregando...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

      // Masks
      const cpfInput = document.getElementById("w-cpf");
      const phoneInput = document.getElementById("w-phone");
      if (cpfInput)
        cpfInput.addEventListener(
          "input",
          (e) => (e.target.value = maskCPF(e.target.value))
        );
      if (phoneInput)
        phoneInput.addEventListener(
          "input",
          (e) => (e.target.value = maskPhone(e.target.value))
        );

      // Add Walker
      document
        .getElementById("form-add-walker")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = document.getElementById("btn-create-walker");
          const name = document.getElementById("w-name").value;
          const cpf = document.getElementById("w-cpf").value;
          const phone = document.getElementById("w-phone").value;
          const email = document.getElementById("w-email").value;
          const password = document.getElementById("w-password").value;

          if (password.length < 6) {
            toastService.error("Senha curta.");
            return;
          }

          let secondaryApp = null;
          try {
            btn.disabled = true;
            btn.innerText = "...";
            const appName = `Secondary_${Date.now()}`;
            secondaryApp = initializeApp(firebaseConfig, appName);
            const secondaryAuth = getAuth(secondaryApp);
            const userCred = await createUserWithEmailAndPassword(
              secondaryAuth,
              email,
              password
            );
            await updateProfile(userCred.user, { displayName: name });
            await setDoc(doc(db, "users", userCred.user.uid), {
              name,
              email,
              cpf,
              phone,
              role: "walker",
              managerId: user.uid,
              isVerified: true,
              createdAt: serverTimestamp(),
            });
            toastService.success("Walker criado!");
            document.getElementById("form-add-walker").reset();
          } catch (err) {
            toastService.error(err.message);
          } finally {
            if (secondaryApp) await deleteApp(secondaryApp);
            btn.disabled = false;
            btn.innerText = "+ Cadastrar";
          }
        });

      // List Team
      const qTeam = query(
        collection(db, "users"),
        where("managerId", "==", user.uid),
        where("role", "==", "walker")
      );
      const unsubTeam = onSnapshot(qTeam, (snap) => {
        const list = document.getElementById("authorized-list");
        const badge = document.getElementById("team-count-badge");
        if (!list) return;
        if (badge) badge.innerText = snap.size;

        if (snap.empty) {
          list.innerHTML =
            '<div class="p-8 text-center text-gray-400">Nenhum walker encontrado.</div>';
          return;
        }

        list.innerHTML = snap.docs
          .map((d) => {
            const w = d.data();
            return `
                    <div class="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                  w.name
                                }" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <p class="font-bold text-gray-900 text-sm">${
                                  w.name
                                }</p>
                                <p class="text-xs text-gray-500">${w.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right hidden sm:block">
                                <p class="text-xs text-gray-400">Celular</p>
                                <p class="text-xs font-medium text-gray-700">${maskPhone(
                                  w.phone || ""
                                )}</p>
                            </div>
                            <button class="btn-delete-walker text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50" data-id="${
                              d.id
                            }">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
          })
          .join("");

        // Re-attach delete listeners
        document.querySelectorAll(".btn-delete-walker").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const uid = e.currentTarget.dataset.id;
            if (confirm("Remover este walker?")) {
              try {
                await updateDoc(doc(db, "users", uid), {
                  managerId: null,
                  isActive: false,
                });
                toastService.success("Removido.");
              } catch (err) {
                toastService.error(err.message);
              }
            }
          });
        });
      });
      unsubscribeListeners.push(unsubTeam);
    };

    const renderBilling = async () => {
      const ownerPix = "55003035000176";
      const ownerZap = "5521983856779";
      const zapLink = `https://wa.me/${ownerZap}?text=Olá! Segue o comprovante da assinatura mensal do GoPaws.`;

      mainContent.innerHTML = `
            <div class="p-8 max-w-2xl mx-auto animate-fade-in">
                <header class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Assinatura Mensal</h2>
                    <p class="text-gray-500">Mantenha seu acesso ativo para gerenciar sua equipe.</p>
                </header>

                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div class="text-center mb-6">
                        <p class="text-xs text-gray-400 uppercase font-bold">Valor Mensal</p>
                        <p class="text-4xl font-bold text-gray-900">R$ 99,90</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200 text-left">
                        <p class="text-xs text-blue-800 uppercase font-bold mb-2">Pagar com PIX (CNPJ)</p>
                        <p class="text-blue-900 font-mono bg-blue-100 p-2 rounded-lg text-sm">${ownerPix}</p>
                        <p class="text-xs text-blue-600 mt-2">Copie a chave e pague no seu app do banco.</p>
                    </div>
                    <a href="${zapLink}" target="_blank" class="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-green-600 transition">
                        <span class="text-xl">✓</span> Enviar Comprovante via WhatsApp
                    </a>
                </div>
            </div>`;
    };

    // --- Tab Switching Logic ---
    const switchTab = async (tab) => {
      // Update Nav UI
      document.querySelectorAll(".nav-item").forEach((btn) => {
        if (btn.dataset.tab === tab) {
          btn.classList.remove("text-gray-400", "hover:bg-gray-800");
          btn.classList.add(
            "bg-blue-600",
            "text-white",
            "shadow-lg",
            "shadow-blue-900/20"
          );
        } else {
          btn.classList.add("text-gray-400", "hover:bg-gray-800");
          btn.classList.remove(
            "bg-blue-600",
            "text-white",
            "shadow-lg",
            "shadow-blue-900/20"
          );
        }
      });

      // Mobile Nav UI
      document.querySelectorAll(".nav-item-mobile").forEach((btn) => {
        if (btn.dataset.tab === tab) btn.classList.remove("opacity-70");
        else btn.classList.add("opacity-70");
      });

      // Clear previous listeners
      unsubscribeListeners.forEach((u) => u());
      unsubscribeListeners = [];

      // Render
      if (tab === "dashboard") await renderDashboard();
      if (tab === "team") await renderTeam();
      if (tab === "billing") await renderBilling();
    };

    // Attach Events
    document.querySelectorAll(".nav-item, .nav-item-mobile").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Initial Render
    await switchTab("dashboard");

    return () => {
      unsubscribeListeners.forEach((u) => u());
    };
  },
};
