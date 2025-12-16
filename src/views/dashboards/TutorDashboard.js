import { db } from "../../services/firebase.js";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { walkService } from "../../services/walkService.js";
import { dbService } from "../../services/dbService.js";
import { toastService } from "../../utils/toastService.js";
import { pricingService } from "../../utils/pricingService.js";

export default {
  async render(container, user) {
    let unsubscribeWaiting = null;
    let unsubscribeMessages = null;
    let searchTimeout = null; // Variável para o Timer

    // 1. Buscar Pets
    let pets = [];
    try {
      pets = await dbService.getUserPets(user.uid);
    } catch (error) {
      console.error(error);
    }

    // 3. Buscar Histórico e Passeio Ativo
    let recentWalks = [];
    let activeWalk = null;
    try {
      const allWalks = await dbService.getUserWalks(user.uid, "tutor");
      // Verifica se existe algum passeio ativo (aceito ou em andamento)
      activeWalk = allWalks.find((w) =>
        ["accepted", "ongoing"].includes(w.status)
      );
      recentWalks = allWalks.slice(0, 3);
    } catch (e) {
      console.error(e);
    }

    container.className = "h-full w-full bg-white flex flex-col relative";
    container.innerHTML = `
            <header class="px-6 pt-8 pb-4 bg-white">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Olá, ${
                          user.name.split(" ")[0]
                        }</h1>
                        <p class="text-gray-500 text-sm">Vamos passear hoje?</p>
                    </div>
                    <div onclick="window.location.hash='/profile'" class="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                          user.name
                        }" alt="Profile">
                    </div>
                </div>

                <!-- Lista Horizontal de Pets -->
                <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    ${
                      pets.length > 0
                        ? pets
                            .map(
                              (p) => `
                        <div class="flex-shrink-0 flex flex-col items-center gap-1">
                            <div class="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl border-2 border-orange-100 overflow-hidden">
                                ${
                                  p.photoUrl
                                    ? `<img src="${p.photoUrl}" class="w-full h-full object-cover">`
                                    : "🐶"
                                }
                            </div>
                            <span class="text-xs font-medium text-gray-600">${
                              p.name
                            }</span>
                        </div>
                    `
                            )
                            .join("")
                        : ""
                    }
                    <button onclick="window.location.hash='/my-pets'" class="flex-shrink-0 flex flex-col items-center gap-1">
                        <div class="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-xl border-2 border-dashed border-gray-300 text-gray-400">
                            +
                        </div>
                        <span class="text-xs font-medium text-gray-400">Novo</span>
                    </button>
                    </div>
            </header>

            <div class="flex-1 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-y-auto">
                <div class="bg-white p-5 rounded-2xl shadow-sm mb-6" id="request-card">
                    <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Solicitar Passeio
                    </h3>

                    <div class="mb-4">
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Quem vai passear?</label>
                        ${
                          pets.length > 0
                            ? `<select id="pet-select" class="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none">
                              ${pets
                                .map(
                                  (p) =>
                                    `<option value="${p.id}" data-name="${
                                      p.name
                                    }" data-photo="${p.photoUrl || ""}">${
                                      p.name
                                    }</option>`
                                )
                                .join("")}
                             </select>`
                            : `<div class="mt-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                                <p class="text-sm text-yellow-800 mb-2">Cadastre um pet primeiro.</p>
                                <button onclick="window.location.hash='/my-pets'" class="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold">Cadastrar</button>
                           </div>`
                        }
                    </div>

                    <div class="mb-6 flex gap-4">
                        <div class="flex-1">
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Duração</label>
                            <select id="duration-select" class="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none">
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Est.</label>
                            <div class="mt-1 p-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100">
                                R$ <span id="price-display">50,00</span>
                            </div>
                        </div>
                    </div>

                    <button id="btn-request-walk" ${
                      pets.length === 0 ? "disabled" : ""
                    } class="w-full bg-black text-white font-bold py-4 rounded-xl shadow-xl hover:bg-gray-800 transition active:scale-95 disabled:opacity-50">
                        Solicitar Passeio
                    </button>
                </div>
                
                <!-- Área de Status (Injetada via JS) -->
                <div id="status-area"></div>

                <!-- Botão Flutuante de Passeio Ativo -->
                ${
                  activeWalk
                    ? `
                <button onclick="window.location.hash='/walk?id=${activeWalk.id}'" class="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 hover:bg-green-700 transition transform hover:scale-105 animate-fade-in">
                    <span class="text-2xl animate-pulse">🐕</span>
                    <div class="text-left leading-tight">
                        <p class="text-[10px] font-bold uppercase text-green-200 tracking-wider">Em Andamento</p>
                        <p class="text-sm font-bold">Acompanhar</p>
                    </div>
                </button>
                `
                    : ""
                }
                
                <!-- Listener de Notificações de Chat -->
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
                            toastService.info(
                              `💬 Nova mensagem: ${lastMsg.text}`
                            );
                          }
                        }
                        msgCount = messages.length;
                        initialLoad = false;
                      }
                    );
                  }
                  return "";
                })()}

                <!-- Histórico Recente -->
                <div class="mt-6">
                    <h3 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Últimos Passeios</h3>
                    <div class="space-y-3 pb-20">
                        ${
                          recentWalks.length > 0
                            ? recentWalks
                                .map(
                                  (w) => `
                            <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 transition">
                                <div class="flex items-center gap-3 flex-1 cursor-pointer" onclick="window.location.hash='/summary?id=${
                                  w.id
                                }'">
                                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">🐕</div>
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
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold ${
                                      w.status === "completed"
                                        ? "text-green-600 bg-green-50"
                                        : "text-orange-600 bg-orange-50"
                                    } px-2 py-1 rounded-full">
                                        ${
                                          w.status === "completed"
                                            ? "Concluído"
                                            : w.status
                                        }
                                    </span>
                                    <button class="btn-reschedule p-2 text-blue-600 hover:bg-blue-50 rounded-full transition" title="Reagendar" data-petid="${
                                      w.dogId
                                    }" data-duration="${w.duration}">🔄</button>
                                </div>
                            </div>
                        `
                                )
                                .join("")
                            : '<p class="text-center text-gray-400 text-sm py-4">Nenhum passeio recente.</p>'
                        }
                    </div>
                </div>
            </div>
        `;

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

    // Lógica de Reagendamento (URL Params ou Botão Interno)
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
      // Limpa URL visualmente
      history.replaceState(null, null, "#/");
    }

    // Lógica de Solicitação
    document
      .getElementById("btn-request-walk")
      .addEventListener("click", async () => {
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
          estimatedPrice: updatePrice(),
          duration: parseInt(durationSelect.value),
        };

        btn.disabled = true;
        btn.textContent = "Iniciando...";

        try {
          const requestId = await walkService.createRequest(
            petData,
            "Localização Atual (GPS)"
          );

          // Esconde o formulário e mostra loading
          card.classList.add("hidden");
          statusArea.innerHTML = `
              <div class="flex flex-col items-center py-10 animate-fade-in text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-6"></div>
                  <h3 class="font-bold text-xl text-gray-900">Procurando Walker...</h3>
                  <p class="text-gray-500 text-sm mb-6">Notificando profissionais próximos.</p>
                  <button id="btn-cancel-search" class="text-red-500 font-bold text-sm hover:underline">Cancelar Busca</button>
              </div>
          `;

          // TIMER: 60 segundos para timeout
          searchTimeout = setTimeout(() => {
            statusArea.innerHTML = `
                <div class="bg-white p-6 rounded-2xl shadow-sm text-center animate-fade-in">
                    <div class="text-4xl mb-3">⏳</div>
                    <h3 class="font-bold text-lg text-gray-900 mb-2">Tempo esgotado</h3>
                    <p class="text-gray-500 text-sm mb-6">Nenhum walker aceitou o pedido ainda. Deseja tentar novamente?</p>
                    <div class="flex gap-3">
                        <button id="btn-retry-no" class="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Não</button>
                        <button id="btn-retry-yes" class="flex-1 py-3 bg-black text-white rounded-xl font-bold">Sim, tentar</button>
                    </div>
                </div>
             `;

            document.getElementById("btn-retry-no").onclick = async () => {
              await deleteDoc(doc(db, "open_requests", requestId));
              window.location.reload();
            };
            document.getElementById("btn-retry-yes").onclick = () => {
              // Recarrega para limpar estado e tentar de novo (simples e eficaz)
              window.location.reload();
            };
          }, 60000); // 60 segundos

          // Cancelar Busca Manualmente
          document.getElementById("btn-cancel-search").onclick = async () => {
            clearTimeout(searchTimeout);
            await deleteDoc(doc(db, "open_requests", requestId));
            window.location.reload();
          };

          // Monitorar Aceite
          unsubscribeWaiting = onSnapshot(
            doc(db, "open_requests", requestId),
            async (docSnap) => {
              if (!docSnap.exists()) return; // Foi deletado
              const data = docSnap.data();

              if (data.status === "accepted" && data.walkId) {
                clearTimeout(searchTimeout); // Para o timer
                toastService.success("Walker encontrado!");
                // Redireciona COM O ID DO PASSEIO
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
      });

    // Listeners para botões de Reagendar (Lista Recente)
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
        document
          .querySelector(".bg-gray-50")
          .scrollTo({ top: 0, behavior: "smooth" });
        toastService.info("Dados preenchidos! Confirme para solicitar.");
      });
    });

    return () => {
      if (unsubscribeWaiting) unsubscribeWaiting();
      if (unsubscribeMessages) unsubscribeMessages();
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  },
};
