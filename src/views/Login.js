import { auth } from "../services/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
        <div class="min-h-screen flex bg-white">
            <!-- Left Side - Image (Desktop Only) -->
            <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative items-center justify-center overflow-hidden">
                <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div class="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                
                <div class="relative z-10 text-center px-12">
                    <h2 class="text-5xl font-black text-white mb-6 tracking-tight">Bem-vindo de volta!</h2>
                    <p class="text-gray-400 text-lg leading-relaxed">Gerencie seus passeios e cuide de quem você ama com a plataforma mais segura do mercado.</p>
                </div>
            </div>

            <!-- Right Side - Form -->
            <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50">
                <div class="w-full max-w-md space-y-8">
                    <div class="text-center lg:text-left">
                        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center lg:justify-start gap-2">
                            <span class="text-4xl">🐾</span> GoPaws.
                        </h1>
                        <p class="mt-2 text-sm text-gray-600">Entre na sua conta para continuar.</p>
                    </div>

                    <form id="auth-form" class="mt-8 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="input-email" required class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="seu@email.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                <input type="password" id="input-password" required class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition" placeholder="••••••••">
                            </div>
                        </div>

                        <button type="submit" id="btn-submit" class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition transform active:scale-95">
                            Entrar
                        </button>
                    </form>

                    <div class="mt-6 text-center">
                        <p class="text-sm text-gray-500">É uma empresa?</p>
                        <button onclick="window.location.hash='/register-manager'" class="text-sm font-bold text-black hover:underline mt-1 transition">
                            Cadastrar minha Pet Shop
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
  },

  async init() {
    const form = document.getElementById("auth-form");
    const submitBtn = document.getElementById("btn-submit");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("input-email").value;
      const password = document.getElementById("input-password").value;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Carregando...";

        await signInWithEmailAndPassword(auth, email, password);
        navigateTo("/"); // Router e Home.js cuidam do redirecionamento por role
      } catch (error) {
        console.error("Erro Firebase:", error);
        let msg = "Ocorreu um erro: " + error.message;

        if (error.code === "auth/operation-not-allowed") {
          msg =
            "ERRO DE CONFIGURAÇÃO: O login por Email/Senha não está ativado no Firebase Console.";
        } else if (error.code === "auth/email-already-in-use") {
          msg = "Este email já está cadastrado.";
        } else if (error.code === "auth/weak-password") {
          msg = "A senha deve ter pelo menos 6 caracteres.";
        } else if (
          error.code === "auth/configuration-not-found" ||
          error.code === "auth/project-not-found" ||
          error.code === "auth/api-key-not-valid"
        ) {
          msg =
            "ERRO DE CONFIGURAÇÃO: O serviço de Autenticação não está ativado. Vá no Firebase Console > Authentication > Sign-in method e ative a opção 'Email/Password'.";
        } else if (error.code === "permission-denied") {
          msg =
            "ERRO DE PERMISSÃO: As regras de segurança do Firestore bloquearam o cadastro. Copie o conteúdo de 'firestore.rules' para a aba 'Regras' no Console do Firebase.";
        }

        alert(msg);
        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar";
      }
    });
  },
};
