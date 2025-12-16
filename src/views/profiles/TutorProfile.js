import { auth, db } from "../../services/firebase.js";
import { updateProfile, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { navigateTo } from "../../router/router.js";
import { toastService } from "../../utils/toastService.js";
import { dbService } from "../../services/dbService.js";

export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 flex flex-col overflow-y-auto">
          <div class="bg-blue-600 pb-20 pt-8 px-6 rounded-b-[40px] shadow-lg relative">
              <div class="flex justify-between items-center text-white mb-6">
                  <button onclick="window.location.hash='/'" class="bg-white/20 p-2 rounded-full backdrop-blur-sm">←</button>
                  <h1 class="font-bold text-lg">Meu Perfil</h1>
                  <button id="btn-logout" class="bg-white/20 p-2 rounded-lg text-xs font-bold backdrop-blur-sm">SAIR</button>
              </div>
              <div class="flex flex-col items-center">
                  <div class="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                      <img id="t-avatar" class="w-full h-full object-cover" src="">
                  </div>
                  <h2 id="t-name" class="text-white font-bold text-xl mt-3">...</h2>
                  <span class="bg-blue-800 text-blue-100 text-xs px-3 py-1 rounded-full mt-1">Tutor</span>
              </div>
          </div>

          <div class="px-6 -mt-10 pb-20 flex-1">
              
              <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between mb-6 cursor-pointer transform hover:scale-[1.02] transition" onclick="window.location.hash='/my-pets'">
                  <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🐶</div>
                      <div>
                          <h3 class="font-bold text-gray-800">Meus Pets</h3>
                          <p class="text-xs text-gray-500">Gerenciar cadastros</p>
                      </div>
                  </div>
                  <span class="text-gray-300">➜</span>
              </div>

              <div class="bg-white rounded-2xl shadow-sm p-6">
                  <h3 class="font-bold text-gray-800 mb-4 text-sm uppercase">Dados Pessoais</h3>
                  <form id="tutor-form" class="space-y-4">
                      <div>
                          <label class="text-xs font-bold text-gray-400 pl-1">Nome Completo</label>
                          <input type="text" id="inp-name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none">
                      </div>
                      <div>
                          <label class="text-xs font-bold text-gray-400 pl-1">E-mail</label>
                          <input type="email" id="inp-email" class="w-full p-3 bg-gray-100 rounded-xl border-none text-gray-500 cursor-not-allowed" disabled>
                          <button type="button" id="btn-reset-password" class="text-xs text-blue-600 font-bold mt-1 hover:underline">Alterar Senha</button>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <label class="text-xs font-bold text-gray-400 pl-1">CPF</label>
                              <input type="text" id="inp-cpf" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none">
                          </div>
                          <div>
                              <label class="text-xs font-bold text-gray-400 pl-1">Celular</label>
                              <input type="text" id="inp-phone" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none">
                          </div>
                      </div>
                      <div>
                          <label class="text-xs font-bold text-gray-400 pl-1">Endereço Residencial</label>
                          <input type="text" id="inp-address" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none" placeholder="Rua, Nº, Bairro">
                      </div>

                      <button type="submit" id="btn-save" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition mt-2">
                          Salvar Dados
                      </button>
                  </form>

                  <div id="favorites-section" class="hidden mt-8">
                      <h3 class="font-bold text-gray-800 mb-4 text-sm uppercase">Walkers Favoritos</h3>
                      <div id="favorites-list" class="flex gap-4 overflow-x-auto pb-4 no-scrollbar"></div>
                  </div>

                  <div class="mt-8 pb-8">
                      <h3 class="font-bold text-gray-800 mb-4 text-sm uppercase">Histórico Recente</h3>
                      <div id="walks-history" class="space-y-3"></div>
                  </div>
              </div>
          </div>
      </div>
    `;
  },
  async init() {
    const user = auth.currentUser;
    if (!user) return navigateTo("/login");

    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    const data = snap.data();

    document.getElementById(
      "t-avatar"
    ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`;
    document.getElementById("t-name").innerText = data.name;
    document.getElementById("inp-name").value = data.name;
    document.getElementById("inp-email").value = data.email || "";
    document.getElementById("inp-cpf").value = data.cpf || "";
    document.getElementById("inp-phone").value = data.phone || "";
    document.getElementById("inp-address").value = data.address || "";

    document
      .getElementById("tutor-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-save");
        btn.disabled = true;
        btn.innerText = "...";
        try {
          await updateProfile(user, {
            displayName: document.getElementById("inp-name").value,
          });
          await updateDoc(docRef, {
            name: document.getElementById("inp-name").value,
            cpf: document.getElementById("inp-cpf").value,
            phone: document.getElementById("inp-phone").value,
            address: document.getElementById("inp-address").value,
          });
          toastService.success("Perfil atualizado!");
        } catch (err) {
          toastService.error("Erro ao salvar.");
        }
        btn.disabled = false;
        btn.innerText = "Salvar Dados";
      });

    // Reset Password
    document
      .getElementById("btn-reset-password")
      .addEventListener("click", async () => {
        if (
          confirm(
            "Enviar e-mail de redefinição de senha para " + user.email + "?"
          )
        ) {
          await sendPasswordResetEmail(auth, user.email);
          toastService.success(
            "E-mail enviado! Verifique sua caixa de entrada."
          );
        }
      });

    // --- CARREGAR FAVORITOS ---
    const favorites = await dbService.getFavorites();
    const favList = document.getElementById("favorites-list");
    if (favorites.length > 0) {
      document.getElementById("favorites-section").classList.remove("hidden");
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
    }

    // --- CARREGAR HISTÓRICO ---
    const walks = await dbService.getUserWalks(user.uid, "tutor");
    const historyContainer = document.getElementById("walks-history");

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
          const rating = walk.rating
            ? `<span class="text-yellow-500 text-xs">★ ${walk.rating}</span>`
            : "";

          // Favorito Toggle
          const isFav = (data.favorites || []).includes(walk.walkerId);
          const heartBtn = walk.walkerId
            ? `<button class="btn-fav ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition active:scale-125" data-id="${
                walk.walkerId
              }">${isFav ? "❤️" : "🤍"}</button>`
            : "";

          return `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🐕</div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${
                              walk.walkerName || "Passeador"
                            }</p>
                            <p class="text-xs text-gray-400">${date}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-full border ${statusClass} uppercase">${statusLabel}</span>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                    <div class="flex items-center gap-2">${rating}</div>
                    <div class="flex items-center gap-2">
                        <button class="btn-reschedule-profile text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition" data-petid="${
                          walk.dogId
                        }" data-duration="${walk.duration}">Reagendar</button>
                        ${heartBtn}
                    </div>
                </div>
            </div>`;
        })
        .join("");

      // Listeners Histórico
      document.querySelectorAll(".btn-fav").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const isFav = await dbService.toggleFavorite(id);
          btn.innerText = isFav ? "❤️" : "🤍";
        });
      });

      document.querySelectorAll(".btn-reschedule-profile").forEach((btn) => {
        btn.addEventListener(
          "click",
          (e) =>
            (window.location.hash = `/?reschedule_pet=${btn.dataset.petid}&reschedule_duration=${btn.dataset.duration}`)
        );
      });
    }

    document.getElementById("btn-logout").onclick = async () => {
      if (confirm("Deseja sair?")) {
        await signOut(auth);
        navigateTo("/login");
      }
    };
  },
};
