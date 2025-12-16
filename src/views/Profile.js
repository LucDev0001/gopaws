import { auth, db } from "../services/firebase.js";
import { updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { dbService } from "../services/dbService.js";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
      <div class="h-screen w-full bg-gray-50 flex flex-col font-sans">
          
          <header class="bg-white px-6 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-between z-20">
              <div class="flex items-center gap-4">
                  <button id="btn-back" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                  </button>
                  <h1 class="text-xl font-bold text-gray-900">Meu Perfil</h1>
              </div>
              <button id="btn-logout" class="text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 px-3 py-2 rounded-lg transition">
                  Sair
              </button>
          </header>

          <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24" id="profile-content">
              
              <div class="max-w-3xl mx-auto space-y-6">
                  
                  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                      <div id="profile-banner" class="h-24 bg-gray-200 w-full"></div>
                      
                      <div class="px-6 pb-6 relative">
                          <div class="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-4">
                              <div class="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg overflow-hidden relative z-10">
                                  <img id="profile-avatar" src="" alt="Avatar" class="w-full h-full object-cover rounded-xl bg-gray-100">
                              </div>
                              <div class="text-center md:text-left flex-1">
                                  <h2 id="profile-name-display" class="text-2xl font-bold text-gray-900 leading-tight">...</h2>
                                  <div class="flex items-center justify-center md:justify-start gap-2 mt-1">
                                      <span id="profile-role-badge" class="px-3 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-bold uppercase tracking-wider">Carregando...</span>
                                      <span id="verified-badge" class="hidden text-blue-500" title="Verificado">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                                      </span>
                                  </div>
                              </div>
                              <div class="flex gap-6 md:gap-8 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                  <div class="text-center">
                                      <p id="stats-walks" class="text-xl font-bold text-gray-900">0</p>
                                      <p class="text-[10px] text-gray-400 uppercase font-bold">Passeios</p>
                                  </div>
                                  <div class="w-px bg-gray-200"></div>
                                  <div class="text-center">
                                      <p id="stats-rating" class="text-xl font-bold text-gray-900">-</p>
                                      <p class="text-[10px] text-gray-400 uppercase font-bold">Nota</p>
                                  </div>
                              </div>
                          </div>

                          <div id="extra-actions" class="border-t border-gray-100 pt-4 hidden">
                              </div>
                      </div>
                  </div>

                  <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                          <span>✏️</span> Editar Informações
                      </h3>
                      
                      <form id="profile-form" class="space-y-5">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div class="md:col-span-2">
                                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome de Exibição</label>
                                  <input type="text" id="input-name" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition font-medium text-gray-800" required>
                              </div>
                              <div class="md:col-span-2">
                                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">E-mail (Login)</label>
                                  <input type="email" id="input-email" class="w-full px-4 py-3 bg-gray-100 rounded-xl border-none text-gray-500 cursor-not-allowed select-none" disabled>
                              </div>
                              
                              <div id="dynamic-fields-container" class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5"></div>
                          </div>

                          <div class="pt-4">
                              <button type="submit" id="btn-save" class="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition transform active:scale-[0.99]">
                                  Salvar Alterações
                              </button>
                          </div>
                      </form>
                  </div>

                  <div id="favorites-section" class="hidden animate-fade-in">
                      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Walkers Favoritos</h3>
                      <div id="favorites-list" class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                          </div>
                  </div>

                  <div>
                      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Histórico Recente</h3>
                      <div id="walks-history" class="space-y-3 pb-8">
                          </div>
                  </div>
              
              </div>
          </div>
      </div>
    `;
  },

  async init() {
    const user = auth.currentUser;
    if (!user) return navigateTo("/login");

    // 1. Carregar Dados
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      return navigateTo("/login");
    }

    const userData = userDoc.data();

    // 2. Navegação Segura
    document.getElementById("btn-back").addEventListener("click", () => {
      navigateTo("/"); // Sempre volta pro Dashboard
    });

    // 3. Renderização Condicional (THEMING)
    const banner = document.getElementById("profile-banner");
    const badge = document.getElementById("profile-role-badge");
    const btnSave = document.getElementById("btn-save");
    const dynamicFields = document.getElementById("dynamic-fields-container");
    const extraActions = document.getElementById("extra-actions");

    // Popula dados básicos
    document.getElementById(
      "profile-avatar"
    ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`;
    document.getElementById("profile-name-display").innerText = userData.name;
    document.getElementById("input-name").value = userData.name;
    document.getElementById("input-email").value = userData.email;

    // Configuração por Tipo de Usuário
    if (userData.role === "manager") {
      // --- MANAGER THEME (Preto/Cinza) ---
      banner.className =
        "h-24 w-full bg-gradient-to-r from-gray-900 to-gray-700";
      badge.innerText = "Empresa / Agência";
      badge.className =
        "px-3 py-0.5 bg-gray-900 text-white text-[10px] rounded-full font-bold uppercase tracking-wider";

      if (userData.isVerified)
        document.getElementById("verified-badge").classList.remove("hidden");

      // Campos do Manager (Grid Layout)
      dynamicFields.innerHTML = `
            <div class="md:col-span-2 border-t border-gray-100 my-2 pt-2">
                <p class="text-xs font-bold text-gray-900 mb-4">Dados Empresariais</p>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">CNPJ</label>
                <input type="text" id="input-cnpj" value="${
                  userData.cnpj || ""
                }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition text-sm">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Telefone</label>
                <input type="tel" id="input-phone" value="${
                  userData.phone || ""
                }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition text-sm">
            </div>
            <div class="md:col-span-2">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Endereço Comercial</label>
                <input type="text" id="input-address" value="${
                  userData.address || ""
                }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition text-sm">
            </div>
            <div class="bg-blue-50 p-4 rounded-xl md:col-span-2 border border-blue-100">
                <p class="text-[10px] font-bold text-blue-800 uppercase mb-2">Dados Bancários (Recebimento)</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-blue-400 uppercase mb-1">Chave PIX</label>
                        <input type="text" id="input-pix" value="${
                          userData.pixKey || ""
                        }" class="w-full px-4 py-2 bg-white rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-blue-400 uppercase mb-1">WhatsApp Financeiro</label>
                        <input type="text" id="input-whatsapp" value="${
                          userData.whatsappNumber || ""
                        }" class="w-full px-4 py-2 bg-white rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                    </div>
                </div>
            </div>
        `;
    } else if (userData.role === "tutor") {
      // --- TUTOR THEME (Azul) ---
      banner.className =
        "h-24 w-full bg-gradient-to-r from-blue-600 to-blue-400";
      badge.innerText = "Tutor Responsável";
      badge.className =
        "px-3 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold uppercase tracking-wider";
      btnSave.className =
        "w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition transform active:scale-[0.99]";

      // Ações Extras (Botão Pets)
      extraActions.classList.remove("hidden");
      extraActions.innerHTML = `
            <button onclick="window.location.hash='/my-pets'" class="w-full py-3 border border-blue-100 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2">
                <span class="text-lg">🐶</span> Gerenciar meus Pets
            </button>
        `;

      // Campos específicos do Tutor
      dynamicFields.innerHTML = `
             <div class="md:col-span-2">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Endereço Residencial</label>
                <input type="text" id="input-address" value="${
                  userData.address || ""
                }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
            </div>
             <div class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">CPF</label>
                    <input type="text" id="input-cpf" value="${
                      userData.cpf || ""
                    }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Celular</label>
                    <input type="tel" id="input-phone" value="${
                      userData.phone || ""
                    }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>
            </div>
        `;
    } else if (userData.role === "walker") {
      // --- WALKER THEME (Verde) ---
      banner.className =
        "h-24 w-full bg-gradient-to-r from-green-600 to-green-400";
      badge.innerText = "Dog Walker Profissional";
      badge.className =
        "px-3 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase tracking-wider";
      btnSave.className =
        "w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition transform active:scale-[0.99]";

      if (userData.isVerified)
        document.getElementById("verified-badge").classList.remove("hidden");

      dynamicFields.innerHTML = `
             <div class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">CPF</label>
                    <input type="text" id="input-cpf" value="${
                      userData.cpf || ""
                    }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm" readonly title="Contate o suporte para alterar">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Celular</label>
                    <input type="tel" id="input-phone" value="${
                      userData.phone || ""
                    }" class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-sm">
                </div>
            </div>
            <div class="md:col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-xs">
                Para alterar dados sensíveis ou bancários, entre em contato com seu gerente.
            </div>
        `;
    }

    // 4. Carregar Histórico e Stats
    const walks = await dbService.getUserWalks(user.uid, userData.role);
    const historyContainer = document.getElementById("walks-history");

    // Stats
    document.getElementById("stats-walks").innerText = walks.length;
    if (walks.length > 0) {
      const ratedWalks = walks.filter((w) => w.rating);
      const avgRating =
        ratedWalks.length > 0
          ? ratedWalks.reduce((a, b) => a + b.rating, 0) / ratedWalks.length
          : 0;
      document.getElementById("stats-rating").innerText =
        avgRating > 0 ? avgRating.toFixed(1) + " ★" : "-";
    } else {
      document.getElementById("stats-rating").innerText = "-";
    }

    // Histórico Lista
    if (walks.length === 0) {
      historyContainer.innerHTML =
        '<div class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p class="text-gray-400 text-sm">Nenhum passeio realizado ainda.</p></div>';
    } else {
      historyContainer.innerHTML = walks
        .map((walk) => {
          const date = walk.startTime
            ? new Date(walk.startTime.seconds * 1000).toLocaleDateString()
            : "Data desconhecida";
          const statusClass =
            walk.status === "completed"
              ? "text-green-600 bg-green-50 border-green-100"
              : "text-orange-500 bg-orange-50 border-orange-100";
          const statusLabel =
            walk.status === "completed" ? "Concluído" : "Em andamento";
          const otherParty =
            userData.role === "walker"
              ? walk.dogName
              : walk.walkerName || "Passeador";
          const rating = walk.rating
            ? `<span class="text-yellow-500 text-xs">★ ${walk.rating}</span>`
            : "";

          // Favoritos (Só aparece se for Tutor)
          const isTutor = userData.role === "tutor";
          const targetId = isTutor ? walk.walkerId : null;
          const isFav = (userData.favorites || []).includes(targetId);
          const heartBtn =
            isTutor && targetId
              ? `<button class="btn-fav ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition active:scale-125" data-id="${targetId}">${
                  isFav ? "❤️" : "🤍"
                }</button>`
              : "";

          // Reagendar (Só aparece se for Tutor)
          const rescheduleBtn =
            userData.role === "tutor"
              ? `<button class="btn-reschedule-profile text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition" data-petid="${walk.dogId}" data-duration="${walk.duration}">Reagendar</button>`
              : "";

          return `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🐕</div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${otherParty}</p>
                            <p class="text-xs text-gray-400">${date}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-full border ${statusClass} uppercase">${statusLabel}</span>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                    <div class="flex items-center gap-2">
                        ${rating}
                    </div>
                    <div class="flex items-center gap-2">
                        ${rescheduleBtn}
                        ${heartBtn}
                    </div>
                </div>
            </div>
          `;
        })
        .join("");
    }

    // 5. Carregar Favoritos (Tutor Only)
    if (userData.role === "tutor") {
      document.getElementById("favorites-section").classList.remove("hidden");
      const favorites = await dbService.getFavorites();
      const favList = document.getElementById("favorites-list");

      if (favorites.length > 0) {
        favList.innerHTML = favorites
          .map(
            (f) => `
            <div class="flex-shrink-0 flex flex-col items-center gap-1 w-16 group cursor-pointer hover:opacity-80 transition">
                <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${
                       f.name
                     }" class="w-full h-full object-cover bg-gray-100">
                </div>
                <span class="text-[10px] text-center font-bold text-gray-600 truncate w-full group-hover:text-blue-600">${
                  f.name.split(" ")[0]
                }</span>
            </div>
        `
          )
          .join("");
      } else {
        favList.innerHTML =
          '<p class="text-xs text-gray-400 pl-1 italic">Você ainda não favoritou nenhum passeador.</p>';
      }
    }

    // --- EVENT LISTENERS ---

    // Toggle Favorito
    document.querySelectorAll(".btn-fav").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isFav = await dbService.toggleFavorite(id);
        btn.innerText = isFav ? "❤️" : "🤍";
      });
    });

    // Reagendar
    document.querySelectorAll(".btn-reschedule-profile").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Redireciona para dashboard com parametros
        window.location.hash = `/?reschedule_pet=${btn.dataset.petid}&reschedule_duration=${btn.dataset.duration}`;
      });
    });

    // Salvar Perfil
    document
      .getElementById("profile-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = document.getElementById("input-name").value;
        const btn = document.getElementById("btn-save");

        let updateData = { name: newName };

        // Coleta dados extras baseado na role
        if (userData.role === "manager") {
          updateData.cnpj = document.getElementById("input-cnpj").value;
          updateData.phone = document.getElementById("input-phone").value;
          updateData.address = document.getElementById("input-address").value;
          updateData.pixKey = document.getElementById("input-pix").value;
          updateData.whatsappNumber =
            document.getElementById("input-whatsapp").value;
        } else if (userData.role === "tutor") {
          updateData.address = document.getElementById("input-address").value;
          updateData.phone = document.getElementById("input-phone").value;
          updateData.cpf = document.getElementById("input-cpf").value;
        } else if (userData.role === "walker") {
          updateData.phone = document.getElementById("input-phone").value;
          // Walker geralmente não edita CPF sozinho por segurança, mas deixei read-only no HTML
        }

        try {
          btn.disabled = true;
          const originalText = btn.innerText;
          btn.innerHTML = `<div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full mx-auto"></div>`;

          await updateProfile(user, { displayName: newName });
          await updateDoc(userDocRef, updateData);

          document.getElementById("profile-name-display").innerText = newName;
          // Recarrega avatar caso o nome mude (seed muda)
          document.getElementById(
            "profile-avatar"
          ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`;

          alert("Perfil atualizado com sucesso!");
          btn.innerText = originalText;
        } catch (error) {
          alert("Erro ao atualizar: " + error.message);
          btn.innerText = "Tentar Novamente";
        } finally {
          btn.disabled = false;
        }
      });

    // Logout
    document
      .getElementById("btn-logout")
      .addEventListener("click", async () => {
        if (confirm("Deseja realmente sair da sua conta?")) {
          await signOut(auth);
          navigateTo("/login");
        }
      });
  },
};
