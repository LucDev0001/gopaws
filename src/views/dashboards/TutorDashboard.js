import { db } from "../../services/firebase.js";
import {
  doc,
  onSnapshot,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { walkService } from "../../services/walkService.js";
import { dbService } from "../../services/dbService.js";
import { toastService } from "../../utils/toastService.js";
import { pricingService } from "../../utils/pricingService.js";
import { pwaService } from "../../services/pwaService.js";
import { PaymentModal } from "../../components/PaymentModal.js";

export default {
  async render(container, user) {
    let unsubscribeWaiting = null;
    let unsubscribeMessages = null;
    let searchTimeout = null;
    let map = null;
    let unsubscribeWalkers = null;
    let unsubscribeUser = null;
    let unsubscribeTransactions = null;

    // 1. Buscar Pets e Dados
    let pets = [];
    let recentWalks = [];
    let activeWalk = null;
    let walletBalance = user.balance || 0;

    try {
      pets = await dbService.getUserPets(user.uid);
      const allWalks = await dbService.getUserWalks(user.uid, "tutor");
      activeWalk = allWalks.find((w) =>
        ["accepted", "ongoing"].includes(w.status)
      );
      recentWalks = allWalks; // Carrega todos para filtrar localmente
    } catch (error) {
      console.error(error);
    }

    // --- HTML ESTRUTURAL ---
    container.className = "h-full w-full bg-gray-50 overflow-y-auto font-sans";
    container.innerHTML = `
        <div class="max-w-6xl mx-auto min-h-screen p-4 md:p-8">
            
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div class="flex items-center gap-4">
                     <div onclick="window.location.hash='/profile/tutor'" class="w-14 h-14 bg-white rounded-full overflow-hidden border-2 border-blue-500 shadow-sm p-0.5 cursor-pointer hover:opacity-80 transition">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                          user.name
                        }" class="w-full h-full rounded-full bg-gray-100" alt="Profile">
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Olá, ${
                          user.name.split(" ")[0]
                        }</h1>
                        <p class="text-gray-500 text-sm">Seu pet merece o melhor passeio.</p>
                    </div>
                </div>
                <button id="btn-install-pwa-dash" class="hidden bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2">
                    📲 Instalar App
                </button>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div class="lg:col-span-7 space-y-6">
                    
                    <!-- CARTEIRA DIGITAL -->
                    <div class="bg-gray-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Meu Saldo GoPaws</p>
                                <h2 class="text-4xl font-bold tracking-tight">R$ <span id="wallet-balance">${walletBalance
                                  .toFixed(2)
                                  .replace(".", ",")}</span></h2>
                            </div>
                            <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl">💳</div>
                        </div>
                        
                        <div class="mt-6 flex gap-3">
                            <button id="btn-add-funds" class="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2">
                                <span>➕</span> Adicionar Saldo
                            </button>
                            <button id="btn-history" class="px-4 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition">
                                📜
                            </button>
                        </div>
                        
                        <!-- Área de Recarga (Hidden) -->
                        <div id="recharge-area" class="hidden mt-6 pt-6 border-t border-gray-800 animate-fade-in">
                            <!-- Injetado via JS -->
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div class="flex justify-between items-center mb-4">
                             <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wider">Minha Matilha</h3>
                             <button onclick="window.location.hash='/my-pets'" class="text-blue-600 text-xs font-bold hover:underline">+ Gerenciar</button>
                        </div>
                        
                        <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                            ${
                              pets.length > 0
                                ? pets
                                    .map(
                                      (p) => `
                                <div class="snap-start flex-shrink-0 w-24 flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl border-2 border-orange-100 overflow-hidden shadow-sm group-hover:border-orange-300 transition-colors">
                                        ${
                                          p.photoUrl
                                            ? `<img src="${p.photoUrl}" class="w-full h-full object-cover">`
                                            : "🐶"
                                        }
                                    </div>
                                    <span class="text-xs font-bold text-gray-600 truncate w-full text-center">${
                                      p.name
                                    }</span>
                                </div>
                            `
                                    )
                                    .join("")
                                : '<p class="text-sm text-gray-400">Nenhum pet cadastrado.</p>'
                            }
                            
                            <button onclick="window.location.hash='/my-pets'" class="snap-start flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
                                <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                                    +
                                </div>
                                <span class="text-xs font-medium text-gray-400">Adicionar</span>
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100" id="request-card">
                        <h3 class="font-bold text-2xl text-gray-900 mb-6">Solicitar Passeio Agora</h3>

                        <div class="space-y-6">
                            <div>
                                <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Quem vai passear?</label>
                                ${
                                  pets.length > 0
                                    ? `
                                    <div class="relative">
                                        <select id="pet-select" class="w-full p-4 pl-4 pr-10 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-700 transition">
                                            ${pets
                                              .map(
                                                (p) =>
                                                  `<option value="${
                                                    p.id
                                                  }" data-name="${
                                                    p.name
                                                  }" data-photo="${
                                                    p.photoUrl || ""
                                                  }" data-observations="${
                                                    p.observations || ""
                                                  }">${p.name}</option>`
                                              )
                                              .join("")}
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                                    </div>`
                                    : `
                                    <div class="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex justify-between items-center">
                                        <p class="text-sm text-yellow-800 font-medium">Cadastre um pet primeiro.</p>
                                        <button onclick="window.location.hash='/my-pets'" class="text-xs bg-white border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-50">Cadastrar</button>
                                   </div>`
                                }
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Duração</label>
                                    <div class="relative">
                                        <select id="duration-select" class="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium">
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">60 min</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Valor Estimado</label>
                                    <div class="p-4 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 flex items-center justify-between">
                                        <span>R$</span>
                                        <span id="price-display" class="text-xl">50,00</span>
                                    </div>
                                </div>
                            </div>

                            <button id="btn-request-walk" ${
                              pets.length === 0 ? "disabled" : ""
                            } class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <span>Buscar Passeador</span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div id="status-area"></div>
                </div>

                <div class="lg:col-span-5 space-y-6">
                    
                    <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                         <div class="flex justify-between items-center mb-4 px-2">
                             <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                 🗺️ Walkers na Região
                             </h3>
                             <span class="flex h-3 w-3 relative">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                             </span>
                         </div>
                         <div id="bg-map" class="w-full h-64 rounded-2xl bg-gray-100 z-0"></div>
                    </div>

                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>📜</span> Últimos Passeios
                        </h3>
                        
                        <div class="flex gap-2 mb-4">
                             <input type="text" id="t-history-filter" placeholder="Buscar walker..." class="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs border border-gray-200">
                        </div>
                        
                        <div class="space-y-4" id="tutor-history-container">
                            <!-- Renderizado via JS abaixo -->
                        </div>
                        <div class="mt-4 text-center">
                            <button id="t-load-more" class="text-xs font-bold text-blue-600 hover:underline hidden">Ver Mais</button>
                        </div>
                    </div>
                </div>
            </div>

            ${
              activeWalk
                ? `
            <div class="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
                <button onclick="window.location.hash='/walk?id=${activeWalk.id}'" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl shadow-blue-900/30 flex items-center gap-4 transition-all transform hover:scale-105 border-4 border-white/20 backdrop-blur-sm">
                    <span class="text-2xl animate-pulse">🛰️</span>
                    <div class="text-left">
                        <p class="text-[10px] font-bold uppercase text-blue-200 tracking-wider">Em Andamento</p>
                        <p class="text-sm font-bold">Rastrear Agora</p>
                    </div>
                </button>
            </div>
            `
                : ""
            }
            
            ${(() => {
              if (activeWalk) {
                let initialLoad = true;
                let msgCount = 0;
                unsubscribeMessages = dbService.listenToMessages(
                  activeWalk.id,
                  (messages) => {
                    if (!initialLoad && messages.length > msgCount) {
                      const lastMsg = messages[messages.length - 1];
                      if (lastMsg.senderId !== user.uid) {
                        // Toast Interno
                        toastService.info(`💬 Nova mensagem: ${lastMsg.text}`);

                        // Notificação do Sistema (Push Local)
                        if (
                          Notification.permission === "granted" &&
                          document.hidden
                        ) {
                          new Notification("Nova mensagem do Walker", {
                            body: lastMsg.text,
                            icon: "/favicon.ico", // ou icone do app
                          });
                        }
                      }
                    }
                    msgCount = messages.length;
                    initialLoad = false;
                  }
                );
              }
              return "";
            })()}
        </div>
    `;

    // --- LÓGICA DE FUNCIONAMENTO (Mantida Original) ---

    // --- LISTENERS DE SALDO E TRANSAÇÕES (REAL-TIME) ---

    // 1. Atualizar Saldo na UI em tempo real
    unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const bal = data.balance || 0;
        walletBalance = bal; // Atualiza variável local para validação de pagamento

        const balanceEl = document.getElementById("wallet-balance");
        if (balanceEl) balanceEl.innerText = bal.toFixed(2).replace(".", ",");
      }
    });

    // 2. Notificar quando recarga for aprovada
    const qTrans = query(
      collection(db, "wallet_transactions"),
      where("tutorId", "==", user.uid)
    );
    unsubscribeTransactions = onSnapshot(qTrans, (snap) => {
      snap.docChanges().forEach((change) => {
        const data = change.doc.data();
        // Se o status mudou para 'completed' (Aprovado pelo Manager)
        if (change.type === "modified" && data.status === "completed") {
          toastService.success(
            `💰 Recarga de R$ ${data.amount.toFixed(2)} aprovada!`
          );

          // Notificação de Sistema (Background)
          if (Notification.permission === "granted" && document.hidden) {
            new Notification("Recarga Aprovada", {
              body: `Seu saldo de R$ ${data.amount.toFixed(
                2
              )} já está disponível.`,
              icon: "/favicon.ico",
            });
          }
        }
      });
    });

    // --- LÓGICA DA CARTEIRA ---
    const btnAddFunds = document.getElementById("btn-add-funds");
    const rechargeArea = document.getElementById("recharge-area");

    btnAddFunds.addEventListener("click", async () => {
      // Busca pricing para saber valor mínimo (1 passeio)
      const pricing = await dbService.getPricing(); // MVP: Pega do primeiro manager

      // Regra: Se saldo <= 0, exige recarga cheia (32). Se tem saldo, permite completar (min 1).
      const minVal = walletBalance <= 0 ? 32 : 1;

      // Sugestões de botões adaptáveis
      const sug1 = walletBalance <= 0 ? 32 : 10;
      const sug2 = walletBalance <= 0 ? 50 : 20;
      const sug3 = walletBalance <= 0 ? 100 : 50;

      rechargeArea.classList.toggle("hidden");
      if (!rechargeArea.classList.contains("hidden")) {
        rechargeArea.innerHTML = `
                <p class="text-sm text-gray-400 mb-3">Selecione um valor para recarga:</p>
                <div class="grid grid-cols-3 gap-2 mb-4">
                    <button class="btn-amount bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-bold transition" data-val="${sug1}">R$ ${sug1}</button>
                    <button class="btn-amount bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-bold transition" data-val="${sug2}">R$ ${sug2}</button>
                    <button class="btn-amount bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-bold transition" data-val="${sug3}">R$ ${sug3}</button>
                </div>
                <div class="flex gap-2 mb-4">
                    <input type="number" id="custom-amount" placeholder="Outro valor (Mín R$ ${minVal})" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                </div>
                <button id="btn-confirm-recharge" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg transition">
                    Gerar PIX de Recarga
                </button>
            `;

        let selectedAmount = 0;

        rechargeArea.querySelectorAll(".btn-amount").forEach((btn) => {
          btn.addEventListener("click", () => {
            document.getElementById("custom-amount").value = "";
            selectedAmount = Number(btn.dataset.val);
            // Visual feedback
            rechargeArea
              .querySelectorAll(".btn-amount")
              .forEach((b) => b.classList.remove("ring-2", "ring-green-500"));
            btn.classList.add("ring-2", "ring-green-500");
          });
        });

        document
          .getElementById("custom-amount")
          .addEventListener("input", (e) => {
            selectedAmount = Number(e.target.value);
            rechargeArea
              .querySelectorAll(".btn-amount")
              .forEach((b) => b.classList.remove("ring-2", "ring-green-500"));
          });

        document
          .getElementById("btn-confirm-recharge")
          .addEventListener("click", async () => {
            if (selectedAmount < minVal)
              return toastService.error(`Valor mínimo: R$ ${minVal}`);

            // 1. Buscar dados do Manager (Pet Shop) para pegar o PIX
            // MVP: Pega o primeiro manager disponível ou um fixo
            const managers = await dbService.getAllManagers();
            if (managers.length === 0)
              return toastService.error(
                "Nenhum Pet Shop disponível para recarga."
              );
            const manager = managers[0]; // MVP

            // 2. Mostrar Modal de Pagamento (Reutilizando PaymentModal)
            const modalHtml = PaymentModal.getHtml(
              manager.pixKey,
              manager.whatsappNumber,
              selectedAmount
            );
            const modalContainer = document.createElement("div");
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
            PaymentModal.init();

            // Ajustar texto do modal para contexto de recarga
            const modalTitle = modalContainer.querySelector("h2");
            const modalDesc = modalContainer.querySelector("p.text-gray-500");
            if (modalTitle) modalTitle.innerText = "Recarga de Saldo";
            if (modalDesc)
              modalDesc.innerText =
                "Faça o PIX e envie o comprovante para liberação.";

            // 3. Criar Intenção de Depósito no Firestore
            try {
              await dbService.createDepositRequest(
                user.uid,
                manager.id,
                selectedAmount
              );
              rechargeArea.classList.add("hidden");
            } catch (e) {
              console.error(e);
              toastService.error("Erro ao criar solicitação.");
            }
          });
      }
    });

    // Histórico
    document
      .getElementById("btn-history")
      .addEventListener("click", async () => {
        const history = await dbService.getWalletHistory(user.uid);
        let html = `<div class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"><div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"><h3 class="font-bold text-lg mb-4">Histórico</h3><div class="space-y-3">`;

        if (history.length === 0)
          html += `<p class="text-gray-400 text-sm">Sem transações.</p>`;

        history.forEach((h) => {
          const color =
            h.status === "completed"
              ? "text-green-600"
              : h.status === "pending"
              ? "text-yellow-600"
              : "text-red-600";
          const icon = h.type === "deposit" ? "📥" : "📤";
          html += `<div class="flex justify-between items-center border-b border-gray-100 pb-2"><div class="flex items-center gap-2"><span>${icon}</span><div><p class="font-bold text-sm capitalize">${
            h.type === "deposit" ? "Recarga" : "Pagamento"
          }</p><p class="text-xs text-gray-400">${new Date(
            h.createdAt.seconds * 1000
          ).toLocaleDateString()}</p></div></div><div class="text-right"><p class="font-bold ${color}">R$ ${
            h.amount
          }</p><p class="text-[10px] uppercase font-bold ${color}">${
            h.status
          }</p></div></div>`;
        });

        html += `</div><button class="mt-4 w-full bg-gray-100 py-3 rounded-xl font-bold" onclick="this.parentElement.parentElement.remove()">Fechar</button></div></div>`;
        const el = document.createElement("div");
        el.innerHTML = html;
        document.body.appendChild(el);
      });

    // --- Lógica de Histórico Tutor (Renderização Dinâmica) ---
    const historyContainer = document.getElementById("tutor-history-container");
    const historyFilter = document.getElementById("t-history-filter");
    const btnLoadMore = document.getElementById("t-load-more");
    let historyLimit = 4;

    const renderTutorHistory = () => {
      const term = historyFilter.value.toLowerCase();
      const filtered = recentWalks.filter((w) =>
        (w.walkerName || "").toLowerCase().includes(term)
      );
      const visible = filtered.slice(0, historyLimit);

      if (visible.length === 0) {
        historyContainer.innerHTML = `<div class="text-center py-10"><div class="text-3xl mb-2 opacity-30">📅</div><p class="text-gray-400 text-sm">Nenhum passeio encontrado.</p></div>`;
      } else {
        historyContainer.innerHTML = visible
          .map(
            (w) => `
                <div class="group bg-gray-50 hover:bg-white hover:shadow-md p-4 rounded-2xl border border-gray-100 transition-all duration-200 cursor-pointer relative" onclick="window.location.hash='/summary?id=${
                  w.id
                }'">
                    <button onclick="event.stopPropagation(); window.deleteWalkTutor('${
                      w.id
                    }')" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1">🗑️</button>
                    <div class="flex justify-between items-start mb-3 pr-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100">🐕</div>
                            <div>
                                <p class="font-bold text-gray-800 text-sm">${
                                  w.dogName
                                }</p>
                                <p class="text-xs text-gray-500">${
                                  w.createdAt
                                    ? new Date(
                                        w.createdAt.seconds * 1000
                                      ).toLocaleDateString()
                                    : ""
                                }</p>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold ${
                          w.status === "completed"
                            ? "text-green-600 bg-green-100"
                            : "text-orange-600 bg-orange-100"
                        } px-2 py-1 rounded-full uppercase tracking-wide">${
              w.status === "completed" ? "Concluído" : w.status
            }</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-gray-200 pt-3 mt-2">
                        <span class="text-xs text-gray-500 font-medium">${
                          w.duration
                        } min</span>
                        <button class="btn-reschedule text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1" data-petid="${
                          w.dogId
                        }" data-duration="${w.duration}">
                            <span>↺</span> Reagendar
                        </button>
                    </div>
                </div>
            `
          )
          .join("");
      }

      if (historyLimit >= filtered.length) btnLoadMore.classList.add("hidden");
      else btnLoadMore.classList.remove("hidden");
    };

    historyFilter.addEventListener("input", renderTutorHistory);
    btnLoadMore.addEventListener("click", () => {
      historyLimit += 4;
      renderTutorHistory();
    });

    window.deleteWalkTutor = async (id) => {
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in";
      modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                <h3 class="font-bold text-lg text-gray-900 mb-2">Ocultar Passeio?</h3>
                <p class="text-gray-500 text-sm mb-6">Este registro será removido da sua visualização de histórico.</p>
                <div class="flex gap-3">
                    <button id="btn-cancel-hist" class="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Cancelar</button>
                    <button id="btn-confirm-hist" class="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition">Ocultar</button>
                </div>
            </div>
        `;
      document.body.appendChild(modal);

      document.getElementById("btn-cancel-hist").onclick = () => modal.remove();
      document.getElementById("btn-confirm-hist").onclick = async () => {
        modal.remove();
        await dbService.hideWalkHistory(id, "tutor");
        const idx = recentWalks.findIndex((w) => w.id === id);
        if (idx > -1) recentWalks.splice(idx, 1);
        renderTutorHistory();
        toastService.success("Histórico atualizado.");
      };
    };

    renderTutorHistory();

    // Lógica de Preço
    const durationSelect = document.getElementById("duration-select");
    const priceDisplay = document.getElementById("price-display");

    const updatePrice = () => {
      const duration = parseInt(durationSelect?.value || 30);
      const petSelect = document.getElementById("pet-select");
      const selectedPet = pets.find((p) => p.id === petSelect?.value);
      const price = pricingService.calculatePrice(duration, selectedPet);
      if (priceDisplay)
        priceDisplay.textContent = price.toFixed(2).replace(".", ",");
      return price;
    };

    if (durationSelect) durationSelect.addEventListener("change", updatePrice);
    const petSel = document.getElementById("pet-select");
    if (petSel) petSel.addEventListener("change", updatePrice); // Adicionei listener no pet também pra atualizar se mudar o pet

    // Inicializar preço correto ao carregar a página
    updatePrice();

    // Lógica de Reagendamento (URL Params)
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    if (urlParams.has("reschedule_pet")) {
      const petId = urlParams.get("reschedule_pet");
      const dur = urlParams.get("reschedule_duration");
      const petSelect = document.getElementById("pet-select");
      if (petSelect) petSelect.value = petId;
      if (durationSelect) {
        durationSelect.value = dur || "30";
        updatePrice();
      }
      toastService.info("Dados do passeio anterior carregados!");
      history.replaceState(null, null, "#/");
    }

    // Listener botões Reagendar (Lista Interna)
    document.querySelectorAll(".btn-reschedule").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const petId = btn.dataset.petid;
        const duration = btn.dataset.duration;
        const petSelect = document.getElementById("pet-select");
        if (petSelect) petSelect.value = petId;
        if (durationSelect) {
          durationSelect.value = duration || "30";
          updatePrice();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        toastService.info("Dados preenchidos! Confirme para solicitar.");
      });
    });

    // Lógica de Solicitação (Cópia exata com ajustes de UI no statusArea)
    const btnRequest = document.getElementById("btn-request-walk");
    if (btnRequest) {
      btnRequest.addEventListener("click", async () => {
        const petSelect = document.getElementById("pet-select");
        if (!petSelect) return toastService.error("Selecione um pet.");

        const btn = document.getElementById("btn-request-walk");
        const card = document.getElementById("request-card");
        const statusArea = document.getElementById("status-area");

        const selectedOption = petSelect.options[petSelect.selectedIndex];
        const petData = {
          id: petSelect.value,
          name: selectedOption.dataset.name,
          photo: selectedOption.dataset.photo,
          observations: selectedOption.dataset.observations, // Captura observações
          estimatedPrice: updatePrice(),
          duration: parseInt(durationSelect.value),
        };

        // --- SELEÇÃO DE PAGAMENTO ---
        const hasBalance = walletBalance >= petData.estimatedPrice;

        const paymentModal = document.createElement("div");
        paymentModal.className =
          "fixed inset-0 bg-black/60 z-[2000] flex items-end md:items-center justify-center p-4 animate-fade-in";
        paymentModal.innerHTML = `
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up">
                <h3 class="font-bold text-xl text-gray-900 mb-2">Forma de Pagamento</h3>
                <p class="text-gray-500 text-sm mb-6">Como deseja pagar por este passeio?</p>
                
                <div class="space-y-3">
                    <button class="w-full p-4 rounded-xl border ${
                      hasBalance
                        ? "border-gray-200 hover:border-black cursor-pointer"
                        : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                    } flex items-center justify-between transition group" ${
          hasBalance
            ? "onclick=\"window.confirmPaymentMethod('balance')\""
            : "disabled"
        }>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 ${
                              hasBalance ? "bg-gray-900" : "bg-gray-400"
                            } text-white rounded-full flex items-center justify-center text-lg">💳</div>
                            <div class="text-left">
                                <p class="font-bold ${
                                  hasBalance ? "text-gray-900" : "text-gray-400"
                                }">Saldo GoPaws</p>
                                <p class="text-xs ${
                                  hasBalance
                                    ? "text-gray-500"
                                    : "text-red-500 font-bold"
                                }">Disponível: R$ ${walletBalance.toFixed(2)} ${
          !hasBalance ? "(Insuficiente)" : ""
        }</p>
                            </div>
                        </div>
                        ${
                          hasBalance
                            ? '<div class="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-black"></div>'
                            : ""
                        }
                    </button>

                    <button class="w-full p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-blue-500 transition group" onclick="window.confirmPaymentMethod('pix')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg">💠</div>
                            <div class="text-left"><p class="font-bold text-gray-900">PIX</p><p class="text-xs text-gray-500">Pagar ao finalizar</p></div>
                        </div>
                    </button>
                    
                    <button class="w-full p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-green-500 transition group" onclick="window.confirmPaymentMethod('cash')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-lg">💵</div>
                            <div class="text-left"><p class="font-bold text-gray-900">Dinheiro / Cartão</p><p class="text-xs text-gray-500">Direto ao Walker</p></div>
                        </div>
                    </button>
                </div>
                <button class="mt-6 w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl" onclick="this.parentElement.parentElement.remove()">Cancelar</button>
            </div>
        `;
        document.body.appendChild(paymentModal);

        window.confirmPaymentMethod = async (method) => {
          paymentModal.remove();

          if (method === "balance" && walletBalance < petData.estimatedPrice) {
            return toastService.error(
              "Saldo insuficiente. Recarregue sua carteira."
            );
          }

          btn.disabled = true;
          btn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Iniciando...`;

          try {
            const requestId = await walkService.createRequest(
              petData,
              user.address || "Endereço não informado",
              method
            );

            // UI: Esconde Form, Mostra Loading Bonito
            card.classList.add("hidden");
            statusArea.innerHTML = `
                  <div class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center animate-fade-in relative overflow-hidden">
                      <div class="absolute inset-0 bg-blue-50/50 animate-pulse"></div>
                      <div class="relative z-10">
                          <div class="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 relative">
                                <div class="absolute w-full h-full border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
                                <span class="text-3xl">📡</span>
                          </div>
                          <h3 class="font-bold text-2xl text-gray-900 mb-2">Buscando Passeador...</h3>
                          <p class="text-gray-500 mb-8 max-w-xs mx-auto">Notificando profissionais verificados próximos à sua localização.</p>
                          
                          <button id="btn-cancel-search" class="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition">
                              Cancelar Solicitação
                          </button>
                      </div>
                  </div>
              `;

            // TIMER
            searchTimeout = setTimeout(() => {
              statusArea.innerHTML = `
                    <div class="bg-white p-8 rounded-3xl shadow-sm text-center animate-fade-in border border-red-100">
                        <div class="text-5xl mb-4">⏳</div>
                        <h3 class="font-bold text-xl text-gray-900 mb-2">Tempo esgotado</h3>
                        <p class="text-gray-500 mb-6">Nenhum walker aceitou o pedido ainda.</p>
                        <div class="flex gap-4">
                            <button id="btn-retry-no" class="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                            <button id="btn-retry-yes" class="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg">Tentar Novamente</button>
                        </div>
                    </div>
                 `;
              document.getElementById("btn-retry-no").onclick = async () => {
                await deleteDoc(doc(db, "open_requests", requestId));
                resetSearchUI();
              };
              document.getElementById("btn-retry-yes").onclick = () =>
                resetSearchUI(true); // true = manter loading se fosse retry, mas aqui vamos resetar para simplificar
            }, 60000);

            // Cancelar
            document.getElementById("btn-cancel-search").onclick = async () => {
              clearTimeout(searchTimeout);
              await deleteDoc(doc(db, "open_requests", requestId));
              resetSearchUI();
            };

            // Função para resetar a UI sem recarregar a página
            const resetSearchUI = (retry = false) => {
              if (unsubscribeWaiting) unsubscribeWaiting();
              if (searchTimeout) clearTimeout(searchTimeout);

              if (!retry) {
                card.classList.remove("hidden");
                statusArea.innerHTML = "";
                btn.disabled = false;
                btn.innerHTML = `<span>Buscar Passeador</span><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
              } else {
                // Se fosse retry, poderia chamar o click do botão novamente,
                // mas por segurança vamos resetar para o usuário clicar de novo.
                window.location.reload();
              }
            };

            // Monitorar
            unsubscribeWaiting = onSnapshot(
              doc(db, "open_requests", requestId),
              async (docSnap) => {
                if (!docSnap.exists()) return;
                const data = docSnap.data();
                if (data.status === "accepted" && data.walkId) {
                  clearTimeout(searchTimeout);
                  toastService.success("Walker encontrado!");
                  window.location.hash = `/walk?id=${data.walkId}`;
                }
              }
            );
          } catch (e) {
            toastService.error("Erro: " + e.message);
            btn.disabled = false;
            btn.textContent = "Solicitar Passeio";
            card.classList.remove("hidden");
          }
        };
        // Fim da lógica de seleção
      });
    }

    // --- PWA INSTALL LOGIC (DASHBOARD) ---
    const installBtn = document.getElementById("btn-install-pwa-dash");

    const cleanupPwa = pwaService.onInstallable(() => {
      installBtn.classList.remove("hidden");
    });

    installBtn.addEventListener("click", async () => {
      const installed = await pwaService.promptInstall();
      if (installed) installBtn.classList.add("hidden");
    });

    // --- INICIALIZAÇÃO DO MAPA DE WALKERS ---
    setTimeout(() => {
      const mapEl = document.getElementById("bg-map");
      if (mapEl && typeof L !== "undefined") {
        // Posição Padrão (SP) caso GPS falhe
        const defaultPos = [-23.5505, -46.6333];

        map = L.map("bg-map", {
          zoomControl: true,
          attributionControl: false,
          dragging: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
        }).setView(defaultPos, 14);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: "OpenStreetMap",
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);

        const walkerMarkers = {}; // Armazena marcadores para atualizar/remover

        // Pegar Localização Real
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 15);

            // Marcador do Tutor (Casa)
            const homeIcon = L.divIcon({
              className: "bg-transparent",
              html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
            });
            L.marker([latitude, longitude], { icon: homeIcon }).addTo(map);

            // Buscar Walkers no Firestore para mostrar no mapa
            try {
              const q = query(
                collection(db, "users"),
                where("role", "==", "walker")
              );

              unsubscribeWalkers = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                  const wData = change.doc.data();
                  const wId = change.doc.id;

                  if (change.type === "removed" || wData.isActive === false) {
                    if (walkerMarkers[wId]) {
                      map.removeLayer(walkerMarkers[wId]);
                      delete walkerMarkers[wId];
                    }
                    return;
                  }

                  // Adicionar ou Atualizar (Se estiver ativo)
                  const isFav = (user.favorites || []).includes(wId);
                  const rating = wData.rating || 5.0;

                  const markerHtml = `
                                <div class="flex flex-col items-center transform transition hover:scale-110 cursor-pointer z-10">
                                    <div class="relative">
                                        <div class="w-10 h-10 rounded-full overflow-hidden border-2 ${
                                          isFav
                                            ? "border-red-500 shadow-red-200"
                                            : "border-white shadow-gray-400"
                                        } shadow-md bg-white">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                              wData.name
                                            }" class="w-full h-full object-cover">
                                        </div>
                                        ${
                                          isFav
                                            ? '<div class="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-[8px]">❤️</div>'
                                            : ""
                                        }
                                    </div>
                                    <div class="mt-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm border border-gray-100 flex items-center gap-1">
                                        <span class="text-[10px] font-bold text-gray-700 whitespace-nowrap">${
                                          wData.name.split(" ")[0]
                                        }</span>
                                        <span class="text-[8px] font-bold text-yellow-500 flex items-center">★ ${Number(
                                          rating
                                        ).toFixed(1)}</span>
                                    </div>
                                </div>
                            `;

                  const customIcon = L.divIcon({
                    className: "bg-transparent",
                    html: markerHtml,
                    iconSize: [80, 80],
                    iconAnchor: [40, 40],
                  });

                  // Posição Determinística (Baseada no ID para não pular no mapa ao atualizar)
                  // Simula walkers próximos ao tutor
                  const hash = wId
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const latOffset = ((hash % 100) / 100 - 0.5) * 0.01;
                  const lngOffset = (((hash * 13) % 100) / 100 - 0.5) * 0.01;
                  const wLat = latitude + latOffset;
                  const wLng = longitude + lngOffset;

                  if (walkerMarkers[wId]) {
                    walkerMarkers[wId].setLatLng([wLat, wLng]);
                    walkerMarkers[wId].setIcon(customIcon);
                  } else {
                    walkerMarkers[wId] = L.marker([wLat, wLng], {
                      icon: customIcon,
                    }).addTo(map);
                  }
                });
              });
            } catch (e) {
              console.error("Erro ao carregar walkers no mapa", e);
            }
          },
          (err) => {
            console.warn("GPS negado ou indisponível", err);
          }
        );
      }
    }, 500); // Pequeno delay para garantir renderização do DOM

    return () => {
      if (unsubscribeWaiting) unsubscribeWaiting();
      if (unsubscribeMessages) unsubscribeMessages();
      if (searchTimeout) clearTimeout(searchTimeout);
      if (unsubscribeWalkers) unsubscribeWalkers();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (map) {
        map.remove();
        map = null;
      }
      window.deleteWalkTutor = null;
      window.confirmPaymentMethod = null;
      cleanupPwa();
    };
  },
};
