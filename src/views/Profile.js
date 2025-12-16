import { auth, db } from "../services/firebase.js";
import { updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { dbService } from "../services/dbService.js";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
            <div class="flex flex-col h-full bg-gray-50">
                <header class="bg-white p-6 shadow-sm flex items-center gap-4">
                    <button onclick="window.history.back()" class="text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-800">Meu Perfil</h1>
                </header>

                <div class="flex-1 overflow-y-auto p-6">
                    <!-- Avatar e Info Básica -->
                    <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-gray-900 to-gray-700"></div>
                        <div class="w-24 h-24 bg-white rounded-full p-1 mb-3 overflow-hidden shadow-lg z-10 -mt-10">
                            <img id="profile-avatar" src="" alt="Avatar" class="w-full h-full object-cover">
                        </div>
                        <h2 id="profile-name-display" class="text-xl font-bold text-gray-900">Carregando...</h2>
                        <span id="profile-role-badge" class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-bold uppercase mt-1">...</span>
                        
                        <div class="grid grid-cols-2 gap-8 mt-6 w-full border-t pt-4">
                            <div class="text-center">
                                <p id="stats-walks" class="text-2xl font-bold text-gray-800">0</p>
                                <p class="text-xs text-gray-500 uppercase tracking-wide">Passeios</p>
                            </div>
                            <div class="text-center border-l">
                                <p id="stats-rating" class="text-2xl font-bold text-gray-800">-</p>
                                <p class="text-xs text-gray-500 uppercase tracking-wide">Avaliação</p>
                            </div>
                        </div>
                    </div>

                    <!-- Formulário de Edição -->
                    <div class="mb-6">
                        <h3 class="text-sm font-bold text-gray-500 uppercase mb-3 ml-1">Dados da Conta</h3>
                        <div class="bg-white p-6 rounded-2xl shadow-sm">
                        <form id="profile-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input type="text" id="input-name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="input-email" class="w-full p-3 bg-gray-100 rounded-xl border-none text-gray-400 cursor-not-allowed" disabled>
                            </div>
                            
                            <!-- Campos Extras para Empresa (Injetados via JS) -->
                            <div id="manager-fields" class="hidden space-y-4">
                                <!-- CNPJ, Endereço, etc -->
                            </div>

                            <button type="submit" id="btn-save" class="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-black transition">
                                Salvar Alterações
                            </button>
                        </form>
                        </div>
                    </div>

                    <!-- Favoritos (Apenas Tutor) -->
                    <div id="favorites-section" class="hidden mb-6">
                        <h3 class="text-sm font-bold text-gray-500 uppercase mb-3 ml-1">Walkers Favoritos</h3>
                        <div id="favorites-list" class="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            <p class="text-gray-400 text-sm pl-1">Nenhum favorito ainda.</p>
                        </div>
                    </div>

                    <!-- Histórico -->
                    <h3 class="text-sm font-bold text-gray-500 uppercase mb-3 ml-1">Histórico Completo</h3>
                    <div id="walks-history" class="space-y-3">
                        <p class="text-center text-gray-400 py-4">Carregando histórico...</p>
                    </div>

                    <button id="btn-logout" class="w-full mt-8 mb-8 text-red-500 font-bold py-4 rounded-xl bg-white border border-red-100 hover:bg-red-50 transition shadow-sm">
                        Sair da Conta
                    </button>
                </div>
            </div>
        `;
  },

  async init() {
    const user = auth.currentUser;
    if (!user) return navigateTo("/login");

    // 1. Carregar Dados do Usuário
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    document.getElementById(
      "profile-avatar"
    ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`;
    document.getElementById("profile-name-display").innerText = userData.name;
    document.getElementById("input-name").value = userData.name;
    document.getElementById("input-email").value = userData.email;

    // 1.5 Campos Específicos de Empresa
    if (userData.role === "manager") {
      const managerContainer = document.getElementById("manager-fields");
      managerContainer.classList.remove("hidden");
      managerContainer.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input type="text" id="input-cnpj" value="${
                  userData.cnpj || ""
                }" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone Comercial</label>
                <input type="text" id="input-phone" value="${
                  userData.phone || ""
                }" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input type="text" id="input-address" value="${
                  userData.address || ""
                }" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition">
            </div>
            <div class="border-t pt-4 mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                <input type="text" id="input-pix" value="${
                  userData.pixKey || ""
                }" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" id="input-whatsapp" value="${
                  userData.whatsappNumber || ""
                }" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition">
            </div>
        `;
      // Esconde estatísticas irrelevantes para empresa se quiser
      // document.getElementById("stats-rating").parentElement.classList.add("hidden");
    }

    const roleLabel = userData.role === "walker" ? "Dog Walker" : "Tutor";
    const badge = document.getElementById("profile-role-badge");
    badge.innerText = roleLabel;
    badge.className = `px-3 py-1 text-xs rounded-full font-bold uppercase mt-1 ${
      userData.role === "walker"
        ? "bg-green-100 text-green-700"
        : "bg-blue-100 text-blue-700"
    }`;

    // 2. Carregar Histórico
    const walks = await dbService.getUserWalks(user.uid, userData.role);
    const historyContainer = document.getElementById("walks-history");

    // Atualizar Estatísticas
    document.getElementById("stats-walks").innerText = walks.length;
    if (walks.length > 0) {
      const ratedWalks = walks.filter((w) => w.rating);
      if (ratedWalks.length > 0) {
        const avgRating =
          ratedWalks.reduce((acc, w) => acc + w.rating, 0) / ratedWalks.length;
        document.getElementById("stats-rating").innerText =
          avgRating.toFixed(1) + " ★";
      } else {
        document.getElementById("stats-rating").innerText = "N/A";
      }
    } else {
      document.getElementById("stats-rating").innerText = "-";
    }

    // 2.5 Carregar Favoritos (Se for Tutor)
    if (userData.role === "tutor") {
      document.getElementById("favorites-section").classList.remove("hidden");
      const favorites = await dbService.getFavorites();
      const favList = document.getElementById("favorites-list");

      if (favorites.length > 0) {
        favList.innerHTML = favorites
          .map(
            (f) => `
                <div class="flex-shrink-0 flex flex-col items-center w-20">
                    <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-red-100 mb-1 shadow-sm">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                           f.name
                         }" class="w-full h-full object-cover">
                    </div>
                    <span class="text-xs text-center font-bold text-gray-700 truncate w-full">${
                      f.name.split(" ")[0]
                    }</span>
                </div>
            `
          )
          .join("");
      }
    }

    if (walks.length === 0) {
      historyContainer.innerHTML =
        '<p class="text-center text-gray-400 py-4">Nenhum passeio realizado ainda.</p>';
    } else {
      historyContainer.innerHTML = walks
        .map((walk) => {
          const date = walk.startTime
            ? new Date(walk.startTime.seconds * 1000).toLocaleDateString()
            : "Data desconhecida";
          const statusColor =
            walk.status === "completed" ? "text-green-600" : "text-orange-500";
          const statusLabel =
            walk.status === "completed" ? "Concluído" : "Em andamento";
          const otherParty =
            userData.role === "walker" ? walk.dogName : walk.walkerName;
          const rating = walk.rating ? `⭐ ${walk.rating}` : "";

          // Lógica do Botão de Favorito
          const isTutor = userData.role === "tutor";
          const targetId = isTutor ? walk.walkerId : null;
          const isFav = (userData.favorites || []).includes(targetId);
          const heartBtn =
            isTutor && targetId
              ? `<button class="btn-fav ml-2 text-xl focus:outline-none transition transform active:scale-125" data-id="${targetId}">${
                  isFav ? "❤️" : "🤍"
                }</button>`
              : "";

          const rescheduleBtn =
            userData.role === "tutor"
              ? `<button class="btn-reschedule-profile ml-2 text-lg focus:outline-none transition hover:scale-110 text-blue-500" title="Reagendar" data-petid="${walk.dogId}" data-duration="${walk.duration}">🔄</button>`
              : "";

          return `
                    <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div>
                            <p class="font-bold text-gray-800 flex items-center">${otherParty} ${heartBtn}</p>
                            <p class="text-xs text-gray-500">${date}</p>
                        </div>
                        <div class="text-right flex flex-col items-end gap-1">
                            <p class="text-sm font-bold ${statusColor}">${statusLabel}</p>
                            <div class="flex items-center gap-1">
                                <p class="text-xs text-yellow-500">${rating}</p>
                                ${rescheduleBtn}
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    // Listener para botões de favorito
    document.querySelectorAll(".btn-fav").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isFav = await dbService.toggleFavorite(id);
        btn.innerText = isFav ? "❤️" : "🤍";
      });
    });

    // Listener para botões de Reagendar (Perfil)
    document.querySelectorAll(".btn-reschedule-profile").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.hash = `/?reschedule_pet=${btn.dataset.petid}&reschedule_duration=${btn.dataset.duration}`;
      });
    });

    // 3. Eventos
    document
      .getElementById("profile-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = document.getElementById("input-name").value;

        const updateData = { name: newName };

        // Captura dados extras se for manager
        if (userData.role === "manager") {
          updateData.cnpj = document.getElementById("input-cnpj").value;
          updateData.phone = document.getElementById("input-phone").value;
          updateData.address = document.getElementById("input-address").value;
          updateData.pixKey = document.getElementById("input-pix").value;
          updateData.whatsappNumber =
            document.getElementById("input-whatsapp").value;
        }

        const btn = document.getElementById("btn-save");

        try {
          btn.disabled = true;
          btn.innerText = "Salvando...";
          await updateProfile(user, { displayName: newName });
          await updateDoc(userDocRef, updateData);

          document.getElementById("profile-name-display").innerText = newName;
          alert("Perfil atualizado com sucesso!");
        } catch (error) {
          alert("Erro ao atualizar: " + error.message);
        } finally {
          btn.disabled = false;
          btn.innerText = "Salvar Alterações";
        }
      });

    document
      .getElementById("btn-logout")
      .addEventListener("click", async () => {
        if (confirm("Deseja realmente sair?")) {
          await signOut(auth);
          navigateTo("/login");
        }
      });
  },
};
