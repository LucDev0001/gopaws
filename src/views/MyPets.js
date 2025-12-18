import { dbService } from "../services/dbService.js";
import { auth } from "../services/firebase.js";
import { toastService } from "../utils/toastService.js";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
      <div class="min-h-screen bg-gray-50 p-6 font-sans">
        <div class="max-w-md mx-auto">
            <header class="flex items-center gap-4 mb-8">
                <button onclick="window.history.back()" class="bg-white p-3 rounded-full shadow-sm text-gray-600 hover:bg-gray-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 class="text-2xl font-bold text-gray-900">Minha Matilha</h1>
            </header>

            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h2 class="font-bold text-lg mb-4">Adicionar Novo Pet</h2>
                <form id="form-add-pet" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Pet</label>
                        <input type="text" id="p-name" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="Ex: Rex" required>
                    </div>
                    
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Foto (URL)</label>
                        <input type="url" id="p-photo" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="https://...">
                        <p class="text-[10px] text-gray-400 mt-1">Dica: Use uma URL de imagem pública.</p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Observações (Alergias, Comportamento)</label>
                        <textarea id="p-obs" rows="3" class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none transition" placeholder="Ex: Alérgico a frango, reativo com outros machos..."></textarea>
                    </div>

                    <button type="submit" id="btn-save-pet" class="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition">
                        Salvar Pet
                    </button>
                </form>
            </div>

            <div id="pets-list" class="space-y-4">
                <p class="text-center text-gray-400 py-4">Carregando seus pets...</p>
            </div>
        </div>
      </div>
    `;
  },

  async init() {
    const user = auth.currentUser;
    if (!user) return navigateTo("/login");

    const renderList = async () => {
      const list = document.getElementById("pets-list");
      try {
        const pets = await dbService.getUserPets(user.uid);

        if (pets.length === 0) {
          list.innerHTML = `<div class="text-center py-8 text-gray-400"><span class="text-4xl block mb-2">🐕</span>Nenhum pet cadastrado.</div>`;
          return;
        }

        list.innerHTML = pets
          .map(
            (pet) => `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                    ${
                      pet.photoUrl
                        ? `<img src="${pet.photoUrl}" class="w-full h-full object-cover">`
                        : '<div class="w-full h-full flex items-center justify-center text-2xl">🐶</div>'
                    }
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900">${pet.name}</h3>
                    ${
                      pet.observations
                        ? `<p class="text-xs text-red-500 font-medium mt-1">⚠️ ${pet.observations}</p>`
                        : '<p class="text-xs text-gray-400">Sem observações</p>'
                    }
                </div>
            </div>
        `
          )
          .join("");
      } catch (e) {
        console.error(e);
        list.innerHTML = `<p class="text-red-500 text-center">Erro ao carregar pets.</p>`;
      }
    };

    renderList();

    document
      .getElementById("form-add-pet")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-save-pet");
        const name = document.getElementById("p-name").value;
        const photoUrl = document.getElementById("p-photo").value;
        const observations = document.getElementById("p-obs").value;

        try {
          btn.disabled = true;
          btn.innerText = "Salvando...";

          await dbService.addPet({
            name,
            photoUrl,
            observations,
          });

          toastService.success("Pet adicionado com sucesso!");
          document.getElementById("form-add-pet").reset();
          renderList();
        } catch (err) {
          toastService.error(err.message);
        } finally {
          btn.disabled = false;
          btn.innerText = "Salvar Pet";
        }
      });
  },
};
