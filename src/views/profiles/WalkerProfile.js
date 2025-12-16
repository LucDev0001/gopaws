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
          <div class="bg-green-600 p-6 rounded-b-[30px] shadow-lg text-white">
              <div class="flex justify-between items-center mb-6">
                   <button onclick="window.location.hash='/'" class="bg-white/20 p-2 rounded-full">←</button>
                   <h1 class="font-bold">Perfil do Walker</h1>
                   <button id="btn-logout" class="bg-white/20 px-3 py-1 rounded text-xs font-bold">SAIR</button>
              </div>
              
              <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-full bg-white p-1">
                      <img id="w-avatar" class="w-full h-full rounded-full object-cover bg-gray-100" src="">
                  </div>
                  <div>
                      <h2 id="w-name" class="font-bold text-lg">...</h2>
                      <div class="flex items-center gap-2">
                          <span class="text-xs bg-green-800 px-2 py-0.5 rounded text-green-100">Verificado ✓</span>
                      </div>
                  </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-6">
                  <div class="bg-green-700/50 p-3 rounded-xl text-center">
                      <span class="block text-2xl font-bold" id="stat-rating">-</span>
                      <span class="text-xs text-green-200 uppercase">Avaliação</span>
                  </div>
                  <div class="bg-green-700/50 p-3 rounded-xl text-center">
                      <span class="block text-2xl font-bold" id="stat-count">0</span>
                      <span class="text-xs text-green-200 uppercase">Passeios</span>
                  </div>
              </div>
          </div>

          <div class="px-6 py-6 flex-1">
              <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      ✏️ Dados de Cadastro
                  </h3>
                  <form id="walker-form" class="space-y-4">
                      <div>
                          <label class="text-xs font-bold text-gray-400 pl-1">Nome</label>
                          <input type="text" id="inp-name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 outline-none">
                      </div>
                      <div>
                          <label class="text-xs font-bold text-gray-400 pl-1">E-mail</label>
                          <input type="email" id="inp-email" class="w-full p-3 bg-gray-100 rounded-xl border-none text-gray-500 cursor-not-allowed" disabled>
                          <button type="button" id="btn-reset-password" class="text-xs text-green-600 font-bold mt-1 hover:underline">Alterar Senha</button>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <label class="text-xs font-bold text-gray-400 pl-1">CPF (Leitura)</label>
                              <input type="text" id="inp-cpf" class="w-full p-3 bg-gray-100 rounded-xl border-none text-gray-500 cursor-not-allowed" readonly>
                          </div>
                          <div>
                              <label class="text-xs font-bold text-gray-400 pl-1">Celular</label>
                              <input type="text" id="inp-phone" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 outline-none">
                          </div>
                      </div>
                      
                      <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mt-4">
                           <p class="text-xs text-yellow-800">Para alterar dados sensíveis como CPF ou Chave PIX, entre em contato com seu gerente.</p>
                      </div>

                      <button type="submit" id="btn-save" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition mt-2">
                          Atualizar Contato
                      </button>
                  </form>

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
      "w-avatar"
    ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`;
    document.getElementById("w-name").innerText = data.name;
    document.getElementById("inp-name").value = data.name;
    document.getElementById("inp-email").value = data.email || "";
    document.getElementById("inp-cpf").value = data.cpf || "";
    document.getElementById("inp-phone").value = data.phone || "";

    document
      .getElementById("walker-form")
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
            phone: document.getElementById("inp-phone").value,
          });
          toastService.success("Dados atualizados!");
        } catch (err) {
          toastService.error("Erro.");
        }
        btn.disabled = false;
        btn.innerText = "Atualizar Contato";
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

    // --- CARREGAR ESTATÍSTICAS E HISTÓRICO ---
    const walks = await dbService.getUserWalks(user.uid, "walker");

    // Stats
    document.getElementById("stat-count").innerText = walks.length;
    const ratedWalks = walks.filter((w) => w.rating);
    const avgRating =
      ratedWalks.length > 0
        ? ratedWalks.reduce((a, b) => a + b.rating, 0) / ratedWalks.length
        : 0;
    document.getElementById("stat-rating").innerText =
      avgRating > 0 ? avgRating.toFixed(1) : "-";

    // History
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

          return `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🐕</div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${
                              walk.dogName || "Pet"
                            }</p>
                            <p class="text-xs text-gray-400">${date}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-full border ${statusClass} uppercase">${statusLabel}</span>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                    <div class="flex items-center gap-2">${rating}</div>
                </div>
            </div>`;
        })
        .join("");
    }

    document.getElementById("btn-logout").onclick = async () => {
      if (confirm("Sair?")) {
        await signOut(auth);
        navigateTo("/login");
      }
    };
  },
};
