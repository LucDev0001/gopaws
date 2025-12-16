import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";
import { toastService } from "../utils/toastService.js";

export default {
  getHtml() {
    return `
      <div class="h-screen w-full bg-white flex overflow-hidden font-sans">
          
          <div class="hidden md:flex md:w-5/12 lg:w-4/12 bg-blue-600 relative flex-col justify-between p-12 text-white overflow-hidden">
              <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-blue-600/60 to-blue-900/90"></div>
              
              <div class="relative z-10">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md mb-6 border border-white/20">
                      🐕
                  </div>
                  <h1 class="text-4xl font-bold mb-2 tracking-tight">GoPaws Tutor</h1>
                  <p class="text-blue-100 text-lg font-light">Seu pet em boas mãos, sempre.</p>
              </div>

              <div class="relative z-10 space-y-4">
                  <div class="flex items-center gap-3 text-sm text-blue-100">
                      <span class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✓</span>
                      <span>Passeadores Verificados</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-blue-100">
                      <span class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✓</span>
                      <span>Rastreamento em Tempo Real</span>
                  </div>
                  <p class="text-xs text-blue-300 mt-8">© 2025 GoPaws Inc.</p>
              </div>
          </div>

          <div class="flex-1 h-full relative flex flex-col bg-white overflow-y-auto">
              
              <div class="flex-1 flex flex-col justify-center px-4 sm:px-8 py-6 md:p-12 max-w-2xl mx-auto w-full">
                  
                  <div class="md:hidden mb-6 text-center">
                      <div class="inline-block p-2 rounded-full bg-blue-50 text-blue-600 mb-2 text-2xl">🐕</div>
                      <h2 class="text-2xl font-bold text-gray-900">Criar Conta Tutor</h2>
                  </div>

                  <div class="hidden md:block mb-6">
                      <h2 class="text-2xl font-bold text-gray-900">Cadastre-se como Tutor</h2>
                      <p class="text-sm text-gray-500">Encontre os melhores serviços para seu pet.</p>
                  </div>

                  <form id="register-tutor-form" class="space-y-4">
                      <div>
                          <input type="text" id="name" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="Nome Completo" required>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-3">
                          <input type="text" id="cpf" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="CPF" required>
                          <input type="tel" id="phone" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="Telefone" required>
                      </div>

                      <div>
                          <input type="text" id="address" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="Endereço Residencial" required>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="email" id="email" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="Seu E-mail" required>
                          <input type="password" id="password" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" placeholder="Sua Senha" required>
                      </div>
                      
                      <div class="pt-2">
                          <div class="flex items-center gap-2 mb-4">
                              <input type="checkbox" id="terms" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required>
                              <label for="terms" class="text-xs text-gray-500">Li e concordo com os <a href="#/terms" class="text-blue-600 font-bold underline">Termos</a>.</label>
                          </div>

                          <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-blue-700 transition active:scale-[0.98] shadow-blue-200">
                              Criar Conta Grátis
                          </button>
                      </div>
                  </form>
                  
                  <p class="text-center text-gray-400 text-xs mt-4">
                      Já tem conta? <a href="#/login" class="text-blue-600 font-bold hover:underline">Entrar</a>
                  </p>
              </div>
          </div>
      </div>
    `;
  },
  init() {
    document
      .getElementById("register-tutor-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const userData = {
          name: document.getElementById("name").value,
          cpf: document.getElementById("cpf").value,
          phone: document.getElementById("phone").value,
          address: document.getElementById("address").value,
          role: "tutor",
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
          toastService.success("Conta de Tutor criada!");
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
