import { authService } from "../services/authService.js";
import { navigateTo } from "../router/router.js";
import { toastService } from "../utils/toastService.js";

export default {
  getHtml() {
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const role = urlParams.get("role") || "tutor";
    const isManager = role === "manager";

    return `
            <div class="min-h-screen bg-gray-50 flex flex-col justify-center p-6 animate-fade-in">
                <div class="max-w-md w-full mx-auto bg-white p-8 rounded-3xl shadow-xl">
                    <h2 class="text-3xl font-bold mb-2 text-gray-900">${
                      isManager ? "Parceiro GoPaws" : "Crie sua conta"
                    }</h2>
                    <p class="text-gray-500 mb-8">${
                      isManager
                        ? "Cadastre sua Pet Shop ou Agência."
                        : "Seu pet merece o melhor."
                    }</p>
                    
                    <form id="register-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nome ${
                              isManager ? "da Empresa" : "Completo"
                            }</label>
                            <input type="text" id="name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="${
                              isManager
                                ? "Ex: Pet Shop Feliz"
                                : "Ex: Maria Silva"
                            }" required>
                        </div>
                        
                        ${
                          isManager
                            ? `
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">CNPJ</label>
                                <input type="text" id="cnpj" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="00.000.000/0001-00">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                                <input type="tel" id="phone" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="(00) 00000-0000">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Endereço Comercial</label>
                            <input type="text" id="address" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="Rua, Número, Bairro">
                        </div>
                        `
                            : ""
                        }

                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                            <input type="email" id="email" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                            <input type="password" id="password" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" required>
                        </div>
                        
                        <button type="submit" class="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition mt-4">
                            ${isManager ? "Cadastrar Empresa" : "Criar Conta"}
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
      .getElementById("register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(
          window.location.hash.split("?")[1]
        );
        const role = urlParams.get("role") || "tutor";
        const isManager = role === "manager";

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const userData = { name, role };

        if (isManager) {
          userData.cnpj = document.getElementById("cnpj").value;
          userData.phone = document.getElementById("phone").value;
          userData.address = document.getElementById("address").value;
        }

        try {
          await authService.register(email, password, userData);
          toastService.success(
            isManager ? "Empresa cadastrada!" : "Conta criada com sucesso!"
          );
          navigateTo("/");
        } catch (error) {
          toastService.error("Erro no cadastro: " + error.message);
        }
      });
  },
};
