import { auth } from "../services/firebase.js";
import { dbService } from "../services/dbService.js";
import { navigateTo } from "../router/router.js";

export default {
  async getHtml() {
    return `
            <div class="flex flex-col h-full bg-gray-50">
                <header class="bg-white p-6 shadow-sm flex items-center gap-4">
                    <button onclick="window.history.back()" class="text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-800">Meus Pets 🐶</h1>
                </header>

                <div class="flex-1 overflow-y-auto p-6 pb-24">
                    <div id="pets-list" class="space-y-4 mb-8">
                        <p class="text-center text-gray-400 py-4">Carregando...</p>
                    </div>

                    <!-- Formulário de Novo Pet (Hidden by default) -->
                    <div id="new-pet-form" class="hidden bg-white p-6 rounded-2xl shadow-sm animate-fade-in">
                        <h3 class="font-bold text-gray-800 mb-4">Novo Pet</h3>
                        <form id="form-pet" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
                                <input type="text" id="pet-name" required class="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                                <input type="text" id="pet-breed" placeholder="Ex: Vira-lata" class="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Idade (anos)</label>
                                    <input type="number" id="pet-age" class="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                                    <select id="pet-size" class="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black">
                                        <option value="Pequeno">Pequeno</option>
                                        <option value="Médio">Médio</option>
                                        <option value="Grande">Grande</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button type="button" id="btn-cancel-pet" class="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-save-pet" class="flex-1 bg-black text-white font-bold py-3 rounded-xl shadow-lg">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- FAB para Adicionar -->
                <button id="btn-add-pet" class="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center text-3xl hover:scale-105 transition z-10">
                    +
                </button>
            </div>
        `;
  },

  async init() {
    const user = auth.currentUser;
    if (!user) return navigateTo("/login");

    const listContainer = document.getElementById("pets-list");
    const formContainer = document.getElementById("new-pet-form");
    const btnAdd = document.getElementById("btn-add-pet");
    const btnCancel = document.getElementById("btn-cancel-pet");
    const form = document.getElementById("form-pet");

    // Carregar Pets
    const loadPets = async () => {
      const pets = await dbService.getUserPets(user.uid);
      if (pets.length === 0) {
        listContainer.innerHTML = `
                    <div class="text-center py-10">
                        <div class="text-4xl mb-2">🐕</div>
                        <p class="text-gray-500">Você ainda não cadastrou nenhum pet.</p>
                    </div>
                `;
      } else {
        listContainer.innerHTML = pets
          .map(
            (pet) => `
                    <div class="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                            🐶
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800">${pet.name}</h3>
                            <p class="text-sm text-gray-500">${
                              pet.breed || "Sem raça"
                            } • ${pet.size || "Médio"}</p>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    };

    await loadPets();

    // Toggle Form
    const toggleForm = (show) => {
      if (show) {
        formContainer.classList.remove("hidden");
        btnAdd.classList.add("hidden");
        formContainer.scrollIntoView({ behavior: "smooth" });
      } else {
        formContainer.classList.add("hidden");
        btnAdd.classList.remove("hidden");
        form.reset();
      }
    };

    btnAdd.addEventListener("click", () => toggleForm(true));
    btnCancel.addEventListener("click", () => toggleForm(false));

    // Salvar Pet
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnSave = document.getElementById("btn-save-pet");

      try {
        btnSave.disabled = true;
        btnSave.textContent = "Salvando...";

        const petData = {
          name: document.getElementById("pet-name").value,
          breed: document.getElementById("pet-breed").value,
          age: document.getElementById("pet-age").value,
          size: document.getElementById("pet-size").value,
        };

        await dbService.addPet(petData);
        await loadPets();
        toggleForm(false);
        alert("Pet cadastrado com sucesso!");
      } catch (error) {
        alert("Erro ao salvar: " + error.message);
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Salvar";
      }
    });
  },
};
