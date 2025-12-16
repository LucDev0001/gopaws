import { navigateTo } from "../router/router.js";

export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
        <!-- Navbar -->
        <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <div class="text-2xl font-black tracking-tighter flex items-center gap-2 cursor-pointer" onclick="window.scrollTo(0,0)">
                    <span class="text-3xl">🐾</span> GoPaws.
                </div>
                <div class="flex gap-4">
                    <button id="btn-install-pwa" class="hidden bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-100 transition flex items-center gap-2">📲 <span class="hidden sm:inline">Instalar App</span></button>
                    <button id="btn-login-nav" class="text-sm font-bold text-gray-600 hover:text-black transition">Entrar</button>
                    <button id="btn-register-nav" class="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5">Começar</button>
                </div>
            </div>
        </nav>

        <!-- PWA Install Card -->
        <div id="pwa-install-card" class="hidden fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-fade-in-up">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">🐾</div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-sm">Instalar GoPaws</h3>
                    <p class="text-xs text-gray-500 mt-1 leading-relaxed">Adicione à tela inicial para uma experiência melhor e acesso offline.</p>
                </div>
                <button id="btn-close-pwa-card" class="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <button id="btn-pwa-install-action" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg mt-4">
                Instalar Aplicativo
            </button>
        </div>

        <!-- Hero Section -->
        <section class="pt-32 pb-20 px-6 text-center lg:text-left max-w-7xl mx-auto lg:flex items-center gap-12">
            <div class="lg:w-1/2 animate-fade-in-up">
                <div class="inline-block bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                    🚀 A revolução dos passeios
                </div>
                <h1 class="text-5xl lg:text-7xl font-black mb-6 leading-tight text-gray-900">
                    Seu pet feliz,<br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">você tranquilo.</span>
                </h1>
                <p class="text-xl text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Conectamos tutores a passeadores profissionais com rastreamento GPS em tempo real e segurança total.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button id="btn-hero-tutor" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <span>🐕</span> Sou Tutor
                    </button>
                    <button id="btn-hero-manager" class="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:border-gray-300 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <span>🏢</span> Sou Empresa
                    </button>
                </div>
            </div>
            <div class="lg:w-1/2 mt-12 lg:mt-0 relative animate-fade-in">
                <div class="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Dog Walking" class="relative rounded-3xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500 object-cover h-[500px] w-full">
            </div>
        </section>

        <!-- Features Tutor -->
        <section class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Para Tutores Exigentes</h2>
                    <p class="text-gray-500 max-w-2xl mx-auto">Sabemos que seu pet é família. Por isso criamos a experiência mais segura do mercado.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="p-8 rounded-3xl bg-gray-50 hover:bg-blue-50 transition duration-300 group">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition">📍</div>
                        <h3 class="text-xl font-bold mb-3">GPS em Tempo Real</h3>
                        <p class="text-gray-500 leading-relaxed">Acompanhe cada passo do passeio ao vivo pelo mapa. Saiba exatamente onde seu pet está.</p>
                    </div>
                    <div class="p-8 rounded-3xl bg-gray-50 hover:bg-green-50 transition duration-300 group">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition">📸</div>
                        <h3 class="text-xl font-bold mb-3">Relatórios Completos</h3>
                        <p class="text-gray-500 leading-relaxed">Receba fotos, vídeos e marcações de "xixi e cocô" ao final de cada passeio.</p>
                    </div>
                    <div class="p-8 rounded-3xl bg-gray-50 hover:bg-purple-50 transition duration-300 group">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition">🛡️</div>
                        <h3 class="text-xl font-bold mb-3">Segurança Total</h3>
                        <p class="text-gray-500 leading-relaxed">Botão de SOS, chat integrado e walkers verificados por empresas parceiras.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Business -->
        <section class="py-20 bg-gray-900 text-white overflow-hidden relative">
            <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="lg:flex items-center gap-16">
                    <div class="lg:w-1/2 mb-12 lg:mb-0">
                        <h2 class="text-3xl lg:text-4xl font-bold mb-6">Potencialize seu Pet Shop</h2>
                        <p class="text-gray-400 text-lg mb-8 leading-relaxed">
                            Transforme sua gestão de passeios. Abandone o WhatsApp e planilhas. Tenha controle total da sua equipe e faturamento.
                        </p>
                        <ul class="space-y-4">
                            <li class="flex items-center gap-3">
                                <span class="bg-green-500 rounded-full p-1"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span class="font-medium">Gestão de Equipe e Walkers</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="bg-green-500 rounded-full p-1"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span class="font-medium">Painel Financeiro Automático</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="bg-green-500 rounded-full p-1"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span class="font-medium">Pagamentos via PIX Integrado</span>
                            </li>
                        </ul>
                        <button id="btn-cta-manager" class="mt-10 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                            Cadastrar Minha Empresa
                        </button>
                    </div>
                    <div class="lg:w-1/2">
                        <div class="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                            <!-- Mockup Dashboard -->
                            <div class="flex justify-between items-center mb-6">
                                <div class="h-3 w-24 bg-gray-600 rounded-full"></div>
                                <div class="h-8 w-8 bg-gray-600 rounded-full"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="bg-gray-700 p-4 rounded-xl h-24"></div>
                                <div class="bg-gray-700 p-4 rounded-xl h-24"></div>
                            </div>
                            <div class="space-y-3">
                                <div class="h-12 bg-gray-700 rounded-xl w-full"></div>
                                <div class="h-12 bg-gray-700 rounded-xl w-full"></div>
                                <div class="h-12 bg-gray-700 rounded-xl w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-100 pt-16 pb-8">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid md:grid-cols-4 gap-12 mb-12">
                    <div class="col-span-1 md:col-span-2">
                        <div class="text-2xl font-black tracking-tighter mb-4">GoPaws.</div>
                        <p class="text-gray-500 max-w-xs">
                            A plataforma número 1 para conectar amor e cuidado. Segurança para quem passeia, tranquilidade para quem ama.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">Plataforma</h4>
                        <ul class="space-y-2 text-sm text-gray-500">
                            <li><a href="#/login" class="hover:text-blue-600 transition">Login</a></li>
                            <li><a href="#/register-tutor" class="hover:text-blue-600 transition">Para Tutores</a></li>
                            <li><a href="#/register-manager" class="hover:text-blue-600 transition">Para Empresas</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul class="space-y-2 text-sm text-gray-500">
                            <li><a href="#/terms" class="hover:text-blue-600 transition">Termos de Uso</a></li>
                            <li><a href="#/privacy" class="hover:text-blue-600 transition">Privacidade</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-gray-400">© 2025 GoPaws Inc. Todos os direitos reservados.</p>
                    
                    <!-- Developer Section -->
                    <div class="text-center md:text-right">
                        <p class="text-xs text-gray-400 mb-1">Desenvolvido com ❤️ por</p>
                        <p class="font-bold text-gray-700 text-sm">Santos Codes - Luciano Severino dos Santos</p>
                        <div class="flex justify-center md:justify-end gap-4 mt-2">
                            <a href="https://github.com/LucDev0001" target="_blank" class="text-gray-400 hover:text-gray-900 transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/lucianodev/" target="_blank" class="text-gray-400 hover:text-blue-600 transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    `;
  },
  init() {
    // Navigation Handlers
    const navTo = (id, path) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => navigateTo(path);
    };

    navTo("btn-login-nav", "/login");
    navTo("btn-register-nav", "/register-tutor"); // Default CTA
    navTo("btn-hero-tutor", "/register-tutor");
    navTo("btn-hero-manager", "/register-manager");
    navTo("btn-cta-manager", "/register-manager");

    // --- PWA INSTALL LOGIC ---
    // 1. Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => console.log("Service Worker Registered"))
        .catch((err) => console.error("SW Error:", err));
    }

    // 2. Botão de Instalação
    const installBtn = document.getElementById("btn-install-pwa");
    const installCard = document.getElementById("pwa-install-card");
    const btnInstallAction = document.getElementById("btn-pwa-install-action");
    const btnCloseCard = document.getElementById("btn-close-pwa-card");
    let deferredPrompt;

    // --- DETECÇÃO IOS ---
    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Verifica se já está rodando como PWA (standalone)
    const isStandalone =
      window.navigator.standalone ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isStandalone) {
      // Mostra o botão, mas muda o comportamento para redirecionar
      installBtn.classList.remove("hidden");

      const redirectToInstructions = () => {
        navigateTo("/install-ios");
      };

      installBtn.addEventListener("click", redirectToInstructions);

      // Opcional: Mostrar o card flutuante também para iOS com texto adaptado?
      // Por enquanto, vamos focar no botão da navbar para não ser intrusivo demais no iOS
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.classList.remove("hidden");

      // Mostrar card se não foi fechado anteriormente nesta sessão
      if (!sessionStorage.getItem("pwa-card-dismissed")) {
        setTimeout(() => {
          installCard.classList.remove("hidden");
        }, 2000);
      }
    });

    const handleInstall = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installBtn.classList.add("hidden");
        installCard.classList.add("hidden");
      }
      deferredPrompt = null;
    };

    installBtn.addEventListener("click", handleInstall);
    btnInstallAction.addEventListener("click", handleInstall);

    btnCloseCard.addEventListener("click", () => {
      installCard.classList.add("hidden");
      sessionStorage.setItem("pwa-card-dismissed", "true");
    });
  },
};
