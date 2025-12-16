import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";
import { toastService } from "../utils/toastService.js";

export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden animate-fade-in">
          <!-- Background Elements -->
          <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div class="absolute top-[-10%] left-[-5%] w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              <div class="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          </div>

          <div class="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 relative z-10 border border-gray-100">
              <div class="text-center mb-8">
                  <div class="inline-block p-3 rounded-full bg-gray-100 text-gray-800 mb-4 text-2xl shadow-sm">🏢</div>
                  <h2 class="text-3xl font-bold text-gray-900">Parceiro GoPaws</h2>
                  <p class="text-gray-500 mt-2">Cadastre sua Pet Shop ou Agência.</p>
              </div>
              
              <form id="register-manager-form" class="space-y-4">
                  <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nome da Empresa</label>
                      <input type="text" id="name" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="Ex: Pet Shop Feliz" required>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                      <div>
                          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">CNPJ</label>
                          <input type="text" id="cnpj" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="00.000.000/0001-00" required>
                      </div>
                      <div>
                          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                          <input type="tel" id="phone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="(00) 00000-0000" required>
                      </div>
                  </div>

                  <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Endereço Comercial</label>
                      <input type="text" id="address" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="Rua, Número, Bairro" required>
                  </div>

                  <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                      <h4 class="text-xs font-bold text-gray-500 uppercase text-center">Dados para Pagamento (PIX)</h4>
                      <div>
                          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Chave PIX</label>
                          <input type="text" id="pixKey" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="Seu CNPJ, Email ou Telefone" required>
                      </div>
                      <div>
                          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nº WhatsApp (com DDD)</label>
                          <input type="tel" id="whatsappNumber" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="21987654321" required>
                      </div>
                  </div>

                  <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                      <input type="email" id="email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" required>
                  </div>
                  <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                      <input type="password" id="password" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" required>
                  </div>
                  
                  <div class="flex items-start gap-3 pt-2">
                      <input type="checkbox" id="terms" class="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black" required>
                      <label for="terms" class="text-sm text-gray-600 leading-tight">Li e concordo com os <a href="#/terms" class="text-black font-bold underline">Termos de Uso</a> e a <a href="#/privacy" class="text-black font-bold underline">Política de Privacidade</a>.</label>
                  </div>

                  <button type="submit" class="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition mt-4">
                      Cadastrar Empresa
                  </button>
              </form>
              
              <p class="text-center text-gray-400 text-sm mt-6">
                  Já tem conta? <a href="#/login" class="text-black font-bold hover:underline">Entrar</a>
              </p>
          </div>
      </div>
    `;
  },
  init() {
    document
      .getElementById("register-manager-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
          name: document.getElementById("name").value,
          cnpj: document.getElementById("cnpj").value,
          phone: document.getElementById("phone").value,
          address: document.getElementById("address").value,
          pixKey: document.getElementById("pixKey").value,
          whatsappNumber: document.getElementById("whatsappNumber").value,
          role: "manager",
        };
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!document.getElementById("terms").checked) {
          toastService.error("Você deve aceitar os Termos de Uso.");
          return;
        }

        if (password.length < 6) {
          toastService.error("A senha deve ter pelo menos 6 caracteres.");
          return;
        }

        try {
          await authService.register(email, password, userData);
          toastService.success("Empresa cadastrada!");
          navigateTo("/");
        } catch (error) {
          let msg = error.message;
          if (error.code === "auth/email-already-in-use")
            msg = "Este e-mail já está em uso.";
          if (error.code === "auth/weak-password")
            msg = "A senha deve ter pelo menos 6 caracteres.";
          if (error.code === "auth/invalid-email") msg = "E-mail inválido.";
          toastService.error(msg);
        }
      });
  },
};
