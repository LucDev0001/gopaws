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

export default {
  async render(container, user) {
    let unsubscribeWaiting = null;
    let unsubscribeMessages = null;
    let searchTimeout = null;
    let map = null;

    // 1. Buscar Pets e Dados
    let pets = [];
    let recentWalks = [];
    let activeWalk = null;

    try {
      pets = await dbService.getUserPets(user.uid);
      const allWalks = await dbService.getUserWalks(user.uid, "tutor");
      activeWalk = allWalks.find((w) =>
        ["accepted", "ongoing"].includes(w.status)
      );
      recentWalks = allWalks.slice(0, 4); // Aumentei para 4 para preencher melhor a tela
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
                        
                        <div class="space-y-4">
                            ${
                              recentWalks.length > 0
                                ? recentWalks
                                    .map(
                                      (w) => `
                                <div class="group bg-gray-50 hover:bg-white hover:shadow-md p-4 rounded-2xl border border-gray-100 transition-all duration-200 cursor-pointer" onclick="window.location.hash='/summary?id=${
                                  w.id
                                }'">
                                    <div class="flex justify-between items-start mb-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100">🐕</div>
                                            <div>
                                                <p class="font-bold text-gray-800 text-sm">${
                                                  w.dogName
                                                }</p>
                                                <p class="text-xs text-gray-500">${
                                                  w.createdAt
                                                    ? new Date(
                                                        w.createdAt.seconds *
                                                          1000
                                                      ).toLocaleDateString()
                                                    : ""
                                                }</p>
                                            </div>
                                        </div>
                                        <span class="text-[10px] font-bold ${
                                          w.status === "completed"
                                            ? "text-green-600 bg-green-100"
                                            : "text-orange-600 bg-orange-100"
                                        } px-2 py-1 rounded-full uppercase tracking-wide">
                                            ${
                                              w.status === "completed"
                                                ? "Concluído"
                                                : w.status
                                            }
                                        </span>
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
                                    .join("")
                                : `<div class="text-center py-10">
                                <div class="text-3xl mb-2 opacity-30">📅</div>
                                <p class="text-gray-400 text-sm">Seu histórico aparecerá aqui.</p>
                             </div>`
                            }
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
                        toastService.info(`💬 Nova mensagem: ${lastMsg.text}`);
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
          estimatedPrice: updatePrice(),
          duration: parseInt(durationSelect.value),
        };

        btn.disabled = true;
        btn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Iniciando...`;

        try {
          const requestId = await walkService.createRequest(
            petData,
            "Localização Atual (GPS)"
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
              window.location.reload();
            };
            document.getElementById("btn-retry-yes").onclick = () =>
              window.location.reload();
          }, 60000);

          // Cancelar
          document.getElementById("btn-cancel-search").onclick = async () => {
            clearTimeout(searchTimeout);
            await deleteDoc(doc(db, "open_requests", requestId));
            window.location.reload();
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
      });
    }

    // --- PWA INSTALL LOGIC (DASHBOARD) ---
    const installBtn = document.getElementById("btn-install-pwa-dash");
    // Verifica se o evento já foi disparado anteriormente e salvo no window (caso venha da Landing)
    // ou aguarda novo evento
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
              const querySnapshot = await getDocs(q);

              querySnapshot.forEach((doc) => {
                const wData = doc.data();
                // Simulação de localização próxima para MVP (já que nem todos têm lastLocation salvo)
                // Em produção, usaríamos wData.lastLocation
                if (wData.isActive !== false) {
                  const isFav = (user.favorites || []).includes(doc.id);
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

                  // Gera um offset aleatório pequeno para simular walkers na região
                  const latOffset = (Math.random() - 0.5) * 0.01;
                  const lngOffset = (Math.random() - 0.5) * 0.01;
                  L.marker([latitude + latOffset, longitude + lngOffset], {
                    icon: customIcon,
                  }).addTo(map);
                }
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
      if (map) {
        map.remove();
        map = null;
      }
    };
  },
};
