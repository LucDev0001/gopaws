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

// --- Funções Auxiliares ---
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

    // --- Layout Base (Sidebar Fixa + Conteúdo Scrollável) ---
    container.className =
      "flex h-screen w-full bg-gray-50 overflow-hidden font-sans";
    container.innerHTML = `
      <aside class="w-72 bg-gray-900 text-white flex-col hidden md:flex shadow-2xl relative z-20">
        <div class="p-8 flex items-center gap-3 border-b border-gray-800">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/50">G</div>
          <div>
            <span class="font-bold text-lg tracking-tight block">GoPaws</span>
            <span class="text-xs text-gray-400 uppercase tracking-widest">Business</span>
          </div>
        </div>
        
        <nav class="flex-1 px-4 space-y-2 mt-8">
          <button data-tab="dashboard" class="nav-item w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group text-sm font-medium">
            <span class="group-hover:scale-110 transition-transform text-lg">📊</span> <span>Dashboard</span>
          </button>
          <button data-tab="team" class="nav-item w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group text-sm font-medium">
            <span class="group-hover:scale-110 transition-transform text-lg">👥</span> <span>Equipe</span>
          </button>
          <button data-tab="billing" class="nav-item w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group text-sm font-medium">
            <span class="group-hover:scale-110 transition-transform text-lg">💳</span> <span>Assinatura</span>
          </button>
          <button id="btn-install-pwa-manager" class="hidden w-full flex items-center gap-4 px-4 py-4 rounded-xl text-blue-400 hover:bg-blue-900/20 transition-all duration-200 group text-sm font-bold mt-4 border border-blue-900/30">
            <span>📲</span> <span>Instalar App</span>
          </button>
        </nav>

        <div class="p-6 border-t border-gray-800 bg-gray-900/50">
          <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded-xl transition" onclick="window.location.hash='/profile/manager'">
             <div class="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}" class="w-full h-full object-cover" />
             </div>
             <div class="overflow-hidden">
               <p class="text-sm font-bold text-white truncate">${user.name}</p>
               <p class="text-xs text-gray-500 truncate">Gerenciar Perfil</p>
             </div>
          </div>
        </div>
      </aside>

      <div class="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white z-50 px-5 py-4 flex justify-between items-center shadow-md">
         <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/50">G</div>
            <span class="font-bold text-lg tracking-tight">GoPaws</span>
         </div>
         
         <div onclick="window.location.hash='/profile/manager'" class="w-9 h-9 rounded-full bg-gray-800 border border-gray-600 overflow-hidden cursor-pointer shadow-sm active:scale-95 transition-transform">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}" class="w-full h-full object-cover" />
         </div>
      </div>

      <div class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 flex justify-around items-center pb-safe pt-2 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button data-tab="dashboard" class="nav-item-mobile flex flex-col items-center justify-center w-full py-2 text-gray-400 active:text-blue-600 transition-colors">
            <span class="text-2xl mb-1">📊</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">Dash</span>
        </button>
        <button data-tab="team" class="nav-item-mobile flex flex-col items-center justify-center w-full py-2 text-gray-400 active:text-blue-600 transition-colors">
            <span class="text-2xl mb-1">👥</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">Equipe</span>
        </button>
        <button data-tab="billing" class="nav-item-mobile flex flex-col items-center justify-center w-full py-2 text-gray-400 active:text-blue-600 transition-colors">
            <span class="text-2xl mb-1">💳</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">Conta</span>
        </button>
      </div>

      <main class="flex-1 overflow-y-auto relative pt-20 pb-24 md:pt-0 md:pb-0 scroll-smooth" id="main-content">
        </main>
    `;

    const mainContent = document.getElementById("main-content");

    // --- RENDERERS ---

    const renderDashboard = async () => {
      // Bloqueio de Assinatura
      if (user.isSubscriptionPaid !== true) {
        mainContent.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div class="bg-white border border-red-100 p-8 rounded-3xl shadow-xl max-w-md mx-auto relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                    <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
                    <h3 class="font-bold text-xl text-gray-900 mb-2">Acesso Bloqueado</h3>
                    <p class="text-gray-500 text-sm mb-6">Sua assinatura mensal está pendente. Regularize para acessar o painel de gestão.</p>
                    <button class="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-200" onclick="document.querySelector('[data-tab=billing]').click()">Ir para Pagamento</button>
                </div>
            </div>`;
        return;
      }

      mainContent.innerHTML = `
            <div class="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
                <header class="mb-10">
                    <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Visão Geral</h2>
                    <p class="text-gray-500 mt-1">Desempenho da sua agência em tempo real.</p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-40 group hover:border-blue-200 transition-colors">
                        <div class="flex justify-between items-start">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
                            <span class="p-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold">R$</span>
                        </div>
                        <div>
                            <h3 class="text-3xl font-bold text-gray-900 tracking-tight" id="kpi-revenue">R$ ...</h3>
                            <div class="mt-2 text-green-500 text-xs font-bold flex items-center gap-1 bg-green-50 inline-block px-2 py-1 rounded">
                                <span>↗</span> <span id="kpi-revenue-growth">...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-40 group hover:border-blue-200 transition-colors">
                        <div class="flex justify-between items-start">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Passeios</p>
                            <span class="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Total</span>
                        </div>
                        <div>
                            <h3 class="text-3xl font-bold text-gray-900 tracking-tight" id="kpi-walks">...</h3>
                            <p class="mt-2 text-gray-400 text-xs">Passeios realizados</p>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between h-40 relative overflow-hidden">
                        <div class="relative z-10">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Sua Equipe</p>
                            <h3 class="text-4xl font-bold mt-2" id="kpi-team">...</h3>
                            <p class="text-gray-400 text-xs mt-1">Profissionais ativos</p>
                        </div>
                        <div class="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12">👥</div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10 overflow-hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2">
                            <span class="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">🗺️</span> Frota em Tempo Real
                        </h3>
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase flex items-center gap-1">
                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Ao Vivo
                        </span>
                    </div>
                    <div id="manager-map" class="w-full h-96 rounded-2xl bg-gray-100 z-0"></div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span class="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg text-sm">🏆</span> Top Performance
                        </h3>
                        <div id="top-walkers-list" class="space-y-3 flex-1">
                            <p class="text-gray-400 text-sm animate-pulse">Carregando dados...</p>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span class="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">🕒</span> Atividade Recente
                        </h3>
                        <div id="recent-activity-list" class="space-y-2 flex-1">
                            <p class="text-gray-400 text-sm animate-pulse">Carregando dados...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

      // --- Lógica do Mapa ---
      setTimeout(() => {
        const mapEl = document.getElementById("manager-map");
        if (mapEl && typeof L !== "undefined") {
          const map = L.map("manager-map").setView([-23.5505, -46.6333], 13);
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              attribution: "OpenStreetMap",
              maxZoom: 19,
            }
          ).addTo(map);

          const markers = {};
          const qActiveWalks = query(
            collection(db, "walks"),
            where("managerId", "==", user.uid),
            where("status", "==", "ongoing")
          );

          const unsubMap = onSnapshot(qActiveWalks, (snap) => {
            snap.docChanges().forEach((change) => {
              const data = change.doc.data();
              const walkId = change.doc.id;

              if (change.type === "removed") {
                if (markers[walkId]) {
                  map.removeLayer(markers[walkId]);
                  delete markers[walkId];
                }
                return;
              }

              if (data.lastLocation) {
                const { lat, lng } = data.lastLocation;

                if (markers[walkId]) {
                  markers[walkId].setLatLng([lat, lng]);
                  markers[walkId].setPopupContent(`
                      <div class="text-center">
                          <p class="font-bold">${data.walkerName}</p>
                          <p class="text-xs">Passeando com ${data.dogName}</p>
                      </div>
                  `);
                } else {
                  const icon = L.divIcon({
                    className: "bg-transparent",
                    html: `<div class="relative">
                              <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white">
                                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${data.walkerName}" class="w-full h-full object-cover">
                              </div>
                              <div class="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                           </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20],
                  });

                  const marker = L.marker([lat, lng], { icon }).addTo(map)
                    .bindPopup(`
                        <div class="text-center">
                            <p class="font-bold">${data.walkerName}</p>
                            <p class="text-xs">Passeando com ${data.dogName}</p>
                        </div>
                    `);
                  markers[walkId] = marker;
                }
              }
            });

            // Auto-fit bounds
            if (Object.keys(markers).length > 0) {
              const group = new L.featureGroup(Object.values(markers));
              map.fitBounds(group.getBounds(), {
                padding: [50, 50],
                maxZoom: 15,
              });
            }
          });

          unsubscribeListeners.push(unsubMap);
        }
      }, 500);

      // --- Lógica de Busca de Dados ---
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

      const unsubWalks = onSnapshot(qWalks, {
        next: (snap) => {
          let totalRevenue = 0;
          let walksCount = snap.size;
          let walkerStats = {};
          let recentHtml = "";

          snap.docs.forEach((doc, index) => {
            const data = doc.data();
            if (data.price) totalRevenue += Number(data.price);
            if (data.walkerId) {
              if (!walkerStats[data.walkerId])
                walkerStats[data.walkerId] = {
                  name: data.walkerName || "Unknown",
                  count: 0,
                  totalRating: 0,
                  ratingCount: 0,
                };
              walkerStats[data.walkerId].count++;
              if (data.rating) {
                walkerStats[data.walkerId].totalRating += data.rating;
                walkerStats[data.walkerId].ratingCount++;
              }
            }
            if (index < 5) {
              const date = data.createdAt
                ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                : "";
              const statusBadge =
                data.status === "completed"
                  ? `<span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Concluído</span>`
                  : `<span class="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">${data.status}</span>`;

              recentHtml += `
                  <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-default">
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">🐕</div>
                          <div>
                              <p class="text-sm font-bold text-gray-800">${
                                data.dogName || "Pet"
                              }</p>
                              <p class="text-xs text-gray-400">${
                                data.walkerName || "..."
                              }</p>
                          </div>
                      </div>
                      <div class="text-right flex flex-col items-end gap-1">
                          ${statusBadge}
                          <p class="text-[10px] text-gray-400 font-mono">${date}</p>
                      </div>
                  </div>`;
            }
          });

          const revEl = document.getElementById("kpi-revenue");
          if (revEl)
            revEl.innerText = totalRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
          const growthEl = document.getElementById("kpi-revenue-growth");
          if (growthEl) growthEl.innerText = `${walksCount} passeios`;
          const walksEl = document.getElementById("kpi-walks");
          if (walksEl) walksEl.innerText = walksCount;
          const recentContainer = document.getElementById(
            "recent-activity-list"
          );
          if (recentContainer)
            recentContainer.innerHTML =
              recentHtml ||
              '<p class="text-gray-400 text-sm p-4">Nenhuma atividade recente.</p>';

          const walkersArray = Object.values(walkerStats).map((w) => ({
            ...w,
            avgRating: w.ratingCount > 0 ? w.totalRating / w.ratingCount : 0,
          }));
          walkersArray.sort(
            (a, b) => b.avgRating - a.avgRating || b.count - a.count
          );

          const topWalkersHtml = walkersArray
            .slice(0, 3)
            .map(
              (w, i) => `
              <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <div class="font-bold text-gray-300 text-2xl w-6">#${
                    i + 1
                  }</div>
                  <div class="w-12 h-12 rounded-full bg-white p-0.5 border border-gray-200 overflow-hidden shadow-sm">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        w.name
                      }" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1">
                      <p class="font-bold text-gray-800 text-sm">${w.name}</p>
                      <p class="text-xs text-gray-500">${
                        w.count
                      } passeios realizados</p>
                  </div>
                  <div class="text-right">
                      <div class="font-bold text-gray-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                          <span class="text-yellow-400">⭐</span> ${w.avgRating.toFixed(
                            1
                          )}
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
              '<p class="text-gray-400 text-sm p-4 text-center">Dados insuficientes.</p>';
        },
        error: (error) => console.error(error),
      });

      const unsubTeam = onSnapshot(qTeam, (snap) => {
        const el = document.getElementById("kpi-team");
        if (el) el.innerText = snap.size;
      });

      unsubscribeListeners.push(unsubWalks, unsubTeam);
    };

    const renderTeam = async () => {
      mainContent.innerHTML = `
            <div class="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
                <header class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Gestão de Equipe</h2>
                    <p class="text-gray-500">Cadastre e gerencie os acessos dos seus passeadores.</p>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-1">
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span class="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">+</span> Novo Walker
                            </h3>
                            <form id="form-add-walker" class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
                                    <input type="text" id="w-name" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Ex: João Silva" required>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">E-mail Corporativo</label>
                                    <input type="email" id="w-email" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" required>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CPF</label>
                                        <input type="text" id="w-cpf" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" required>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">WhatsApp</label>
                                        <input type="tel" id="w-phone" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" required>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Senha Inicial</label>
                                    <input type="text" id="w-password" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Min. 6 caracteres" required>
                                </div>
                                <button type="submit" id="btn-create-walker" class="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg mt-2">
                                    Cadastrar Profissional
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                            <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 class="font-bold text-gray-800">Membros Ativos</h3>
                                <span class="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-bold" id="team-count-badge">0</span>
                            </div>
                            <div id="authorized-list" class="divide-y divide-gray-100">
                                <p class="p-10 text-center text-gray-400">Carregando lista...</p>
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

      // Add Walker Logic
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

          if (password.length < 6)
            return toastService.error("Senha deve ter 6+ caracteres.");

          let secondaryApp = null;
          try {
            btn.disabled = true;
            btn.innerHTML = "Criando...";
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
            toastService.success("Walker criado com sucesso!");
            document.getElementById("form-add-walker").reset();
          } catch (err) {
            toastService.error(err.message);
          } finally {
            if (secondaryApp) await deleteApp(secondaryApp);
            btn.disabled = false;
            btn.innerText = "Cadastrar Profissional";
          }
        });

      // List Team Logic
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
            '<div class="p-10 text-center flex flex-col items-center text-gray-400"><span class="text-4xl mb-2 opacity-50">🕵️</span><p>Nenhum walker encontrado.</p></div>';
          return;
        }

        list.innerHTML = snap.docs
          .map((d) => {
            const w = d.data();
            return `
                <div class="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
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
                    <div class="flex items-center gap-6">
                        <div class="text-right hidden sm:block">
                            <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Contato</p>
                            <p class="text-xs font-medium text-gray-700 font-mono">${maskPhone(
                              w.phone || ""
                            )}</p>
                        </div>
                        <button class="btn-delete-walker w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Remover" data-id="${
                          d.id
                        }">
                            🗑️
                        </button>
                    </div>
                </div>`;
          })
          .join("");

        document.querySelectorAll(".btn-delete-walker").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            if (
              confirm(
                "Remover este walker da sua equipe? Ele perderá o acesso."
              )
            ) {
              try {
                await updateDoc(doc(db, "users", e.currentTarget.dataset.id), {
                  managerId: null,
                  isActive: false,
                });
                toastService.success("Walker removido.");
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
            <div class="h-full flex items-center justify-center p-6 animate-fade-in">
                <div class="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full text-center">
                    <div class="inline-block p-4 bg-green-50 rounded-full text-green-600 text-4xl mb-6 shadow-sm">💳</div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Assinatura Mensal</h2>
                    <p class="text-gray-500 mb-8">Garanta acesso ilimitado ao painel de gestão.</p>

                    <div class="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
                        <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Total a Pagar</p>
                        <p class="text-5xl font-bold text-gray-900 tracking-tight">R$ 99,90</p>
                        <p class="text-xs text-gray-400 mt-2">Cobrado mensalmente</p>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition" onclick="navigator.clipboard.writeText('${ownerPix}'); alert('Chave PIX copiada!')">
                            <div>
                                <p class="text-[10px] text-blue-800 uppercase font-bold">Chave PIX (CNPJ)</p>
                                <p class="text-blue-900 font-mono text-sm font-bold truncate max-w-[200px]">${ownerPix}</p>
                            </div>
                            <span class="text-blue-500 text-xs font-bold group-hover:text-blue-700">COPIAR</span>
                        </div>
                        
                        <a href="${zapLink}" target="_blank" class="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-green-600 transition hover:shadow-xl hover:-translate-y-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.68-2.031-.967-.272-.099-.47-.149-.669.198-.198.347-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            Enviar Comprovante
                        </a>
                    </div>
                </div>
            </div>`;
    };

    // --- Tab Logic ---
    const switchTab = async (tab) => {
      // Sidebar Active State (Desktop)
      document.querySelectorAll(".nav-item").forEach((btn) => {
        if (btn.dataset.tab === tab) {
          btn.classList.remove("text-gray-400", "hover:bg-gray-800");
          btn.classList.add(
            "bg-blue-600",
            "text-white",
            "shadow-lg",
            "shadow-blue-900/40"
          );
        } else {
          btn.classList.add("text-gray-400", "hover:bg-gray-800");
          btn.classList.remove(
            "bg-blue-600",
            "text-white",
            "shadow-lg",
            "shadow-blue-900/40"
          );
        }
      });

      // Mobile Bottom Nav Active State
      document.querySelectorAll(".nav-item-mobile").forEach((btn) => {
        if (btn.dataset.tab === tab) {
          btn.classList.remove("text-gray-400");
          btn.classList.add("text-blue-600", "font-bold");
        } else {
          btn.classList.add("text-gray-400");
          btn.classList.remove("text-blue-600", "font-bold");
        }
      });

      unsubscribeListeners.forEach((u) => u());
      unsubscribeListeners = [];

      if (tab === "dashboard") await renderDashboard();
      if (tab === "team") await renderTeam();
      if (tab === "billing") await renderBilling();
    };

    document.querySelectorAll(".nav-item, .nav-item-mobile").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // PWA Logic
    const installBtn = document.getElementById("btn-install-pwa-manager");
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

    await switchTab("dashboard");

    return () => {
      unsubscribeListeners.forEach((u) => u());
    };
  },
};
