import { auth, db } from "../../services/firebase.js";
import { updateProfile, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { navigateTo } from "../../router/router.js";
import { toastService } from "../../utils/toastService.js";
import { dbService } from "../../services/dbService.js";

export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 pb-10 overflow-y-auto">
          <div class="bg-gray-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full mix-blend-overlay filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
              <div class="relative z-10 flex justify-between items-start">
                  <button onclick="window.location.hash='/'" class="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">← Voltar</button>
                  <button id="btn-logout" class="text-xs font-bold bg-red-500/20 text-red-200 px-3 py-1.5 rounded border border-red-500/50">SAIR</button>
              </div>
              <div class="mt-6 flex items-center gap-4 relative z-10">
                  <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-2xl">
                      <img id="p-avatar" class="w-full h-full object-cover rounded-[10px] bg-gray-900" src="">
                  </div>
                  <div>
                      <h1 id="p-name" class="text-2xl font-bold">Carregando...</h1>
                      <p class="text-gray-400 text-sm">Gestor Responsável</p>
                  </div>
              </div>
          </div>

          <div class="max-w-3xl mx-auto px-4 -mt-16 relative z-20">
              
              <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
                  <div class="flex justify-between items-center">
                      <div>
                          <p class="text-xs font-bold text-gray-400 uppercase">Status da Conta</p>
                          <p class="text-lg font-bold text-gray-800">Assinatura Ativa</p>
                      </div>
                      <span class="text-2xl">💎</span>
                  </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
                  <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      🏢 Dados da Empresa
                  </h2>
                  <form id="manager-form" class="space-y-5">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Fantasia</label>
                              <input type="text" id="inp-name" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition font-medium">
                          </div>
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                              <input type="email" id="inp-email" class="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" disabled>
                              <button type="button" id="btn-reset-password" class="text-xs text-blue-600 font-bold mt-1 hover:underline">Alterar Senha</button>
                          </div>
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">CNPJ</label>
                              <input type="text" id="inp-cnpj" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition">
                          </div>
                          <div class="md:col-span-2">
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço da Sede</label>
                              <input type="text" id="inp-address" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition">
                          </div>
                      </div>

                      <div class="pt-4 border-t border-gray-100">
                          <p class="text-xs font-bold text-blue-800 mb-4 uppercase">Dados para Recebimento (PIX)</p>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Chave PIX</label>
                                  <input type="text" id="inp-pix" class="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition">
                              </div>
                              <div>
                                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp Financeiro</label>
                                  <input type="text" id="inp-zap" class="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition">
                              </div>
                          </div>
                      </div>

                      <button type="submit" id="btn-save" class="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition mt-4">
                          Salvar Alterações
                      </button>
                  </form>

                  <div class="mt-8 pb-8">
                      <h3 class="font-bold text-gray-800 mb-4 text-sm uppercase">Histórico da Agência</h3>
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

    // Load Data
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    const data = snap.data();

    // Populate
    document.getElementById(
      "p-avatar"
    ).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`;
    document.getElementById("p-name").innerText = data.name;
    document.getElementById("inp-name").value = data.name;
    document.getElementById("inp-email").value = data.email || "";
    document.getElementById("inp-cnpj").value = data.cnpj || "";
    document.getElementById("inp-address").value = data.address || "";
    document.getElementById("inp-pix").value = data.pixKey || "";
    document.getElementById("inp-zap").value = data.whatsappNumber || "";

    // Save
    document
      .getElementById("manager-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-save");
        btn.disabled = true;
        btn.innerText = "Salvando...";
        try {
          await updateProfile(user, {
            displayName: document.getElementById("inp-name").value,
          });
          await updateDoc(docRef, {
            name: document.getElementById("inp-name").value,
            cnpj: document.getElementById("inp-cnpj").value,
            address: document.getElementById("inp-address").value,
            pixKey: document.getElementById("inp-pix").value,
            whatsappNumber: document.getElementById("inp-zap").value,
          });
          toastService.success("Dados da empresa atualizados!");
        } catch (err) {
          toastService.error("Erro ao salvar.");
        }
        btn.disabled = false;
        btn.innerText = "Salvar Alterações";
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

    // --- CARREGAR HISTÓRICO ---
    const walks = await dbService.getUserWalks(user.uid, "manager");
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
                              walk.walkerName || "Walker"
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

    // Logout
    document.getElementById("btn-logout").onclick = async () => {
      if (confirm("Sair do sistema?")) {
        await signOut(auth);
        navigateTo("/login");
      }
    };
  },
};
