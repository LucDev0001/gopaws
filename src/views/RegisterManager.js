import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";
import { toastService } from "../utils/toastService.js";

export default {
  getHtml() {
    return `
      <div class="h-screen w-full bg-white flex overflow-hidden font-sans">
          
          <div class="hidden md:flex md:w-5/12 lg:w-4/12 bg-gray-900 relative flex-col justify-between p-12 text-white overflow-hidden">
              <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=1471&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-900/90"></div>
              
              <div class="relative z-10">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                      🏢
                  </div>
                  <h1 class="text-4xl font-bold mb-2 tracking-tight">GoPaws Business</h1>
                  <p class="text-gray-400 text-lg font-light">Gerencie sua Pet Shop com inteligência.</p>
              </div>

              <div class="relative z-10 space-y-4">
                  <div class="flex items-center gap-3 text-sm text-gray-300">
                      <span class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                      <span>Controle Financeiro</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-300">
                      <span class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</span>
                      <span>Gestão de Clientes</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-8">© 2025 GoPaws Inc.</p>
              </div>
          </div>

          <div class="flex-1 h-full relative flex flex-col bg-white overflow-y-auto">
              
              <div class="flex-1 flex flex-col justify-center px-4 sm:px-8 py-6 md:p-12 max-w-2xl mx-auto w-full">
                  
                  <div class="md:hidden mb-6 text-center">
                      <h2 class="text-2xl font-bold text-gray-900">GoPaws Business</h2>
                      <p class="text-sm text-gray-500">Crie sua conta corporativa</p>
                  </div>

                  <div class="hidden md:block mb-6">
                      <h2 class="text-2xl font-bold text-gray-900">Cadastre sua Empresa</h2>
                  </div>

                  <form id="register-manager-form" class="space-y-4">
                      <div>
                          <input type="text" id="name" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Nome da Empresa" required>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-3">
                          <input type="text" id="cnpj" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="CNPJ" required>
                          <input type="tel" id="phone" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Telefone" required>
                      </div>

                      <div>
                          <input type="text" id="address" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Endereço Comercial" required>
                      </div>

                      <div class="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div class="col-span-2 text-[10px] uppercase font-bold text-blue-800 tracking-wider">Dados Financeiros (PIX)</div>
                          <input type="text" id="pixKey" class="w-full px-3 py-2 bg-white border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Chave PIX" required>
                          <input type="tel" id="whatsappNumber" class="w-full px-3 py-2 bg-white border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="WhatsApp" required>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="email" id="email" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="E-mail de acesso" required>
                          <input type="password" id="password" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm" placeholder="Senha" required>
                      </div>
                      
                      <div class="pt-2">
                          <div class="flex items-center gap-2 mb-4">
                              <input type="checkbox" id="terms" class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" required>
                              <label for="terms" class="text-xs text-gray-500">Li e concordo com os <a href="#/terms" class="text-black font-bold underline">Termos</a>.</label>
                          </div>

                          <button type="submit" class="w-full bg-black text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-gray-800 transition active:scale-[0.98]">
                              Cadastrar Empresa
                          </button>
                      </div>
                  </form>
                  
                  <p class="text-center text-gray-400 text-xs mt-4">
                      Já tem conta? <a href="#/login" class="text-black font-bold hover:underline">Entrar</a>
                  </p>
              </div>
          </div>
      </div>
    `;
  },
  init() {
    // A lógica permanece a mesma
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
