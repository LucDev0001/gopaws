export default {
  getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
          <!-- Header -->
          <header class="bg-white p-6 shadow-sm flex items-center gap-4 sticky top-0 z-10">
              <button onclick="window.history.back()" class="text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
              </button>
              <h1 class="text-xl font-bold text-gray-800">Instalar no iPhone</h1>
          </header>

          <div class="flex-1 overflow-y-auto p-6 max-w-md mx-auto w-full">
              <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-white rounded-2xl mx-auto shadow-md flex items-center justify-center text-4xl mb-4">
                      🐾
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900">GoPaws para iOS</h2>
                  <p class="text-gray-500 mt-2 text-sm">O iOS não permite instalação automática. Siga os 3 passos simples abaixo:</p>
              </div>

              <div class="space-y-4">
                  <!-- Passo 1 -->
                  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
                      <div class="flex-1">
                          <p class="font-bold text-gray-800 text-sm">Toque no botão Compartilhar</p>
                          <p class="text-xs text-gray-500 mt-1">Localizado na barra inferior do Safari.</p>
                      </div>
                      <div class="text-blue-600">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                      </div>
                  </div>

                  <!-- Passo 2 -->
                  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
                      <div class="flex-1">
                          <p class="font-bold text-gray-800 text-sm">Role para cima e selecione</p>
                          <p class="text-xs text-gray-500 mt-1">"Adicionar à Tela de Início"</p>
                      </div>
                      <div class="text-gray-600 border border-gray-300 rounded p-1">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      </div>
                  </div>

                  <!-- Passo 3 -->
                  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                      <div class="flex-1">
                          <p class="font-bold text-gray-800 text-sm">Toque em "Adicionar"</p>
                          <p class="text-xs text-gray-500 mt-1">No canto superior direito da tela.</p>
                      </div>
                      <div class="text-blue-600 font-bold text-xs uppercase">
                          Add
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
  },
};
