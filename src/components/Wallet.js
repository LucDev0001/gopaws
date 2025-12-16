import { dbService } from "../services/dbService.js";
import { auth } from "../services/firebase.js";

export const Wallet = {
  async getHtml() {
    const user = auth.currentUser;
    if (!user) return "";

    try {
      const walks = await dbService.getUserWalks(user.uid, "walker");
      const completedWalks = walks.filter((w) => w.status === "completed");

      const total = completedWalks.reduce((acc, walk) => {
        return acc + (Number(walk.price) || 0);
      }, 0);

      return `
            <div class="bg-gray-900 text-white p-5 rounded-2xl shadow-lg mb-6 animate-fade-in">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-gray-400 text-sm font-bold uppercase tracking-wider">Minha Carteira</h3>
                    <span class="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">${
                      completedWalks.length
                    } passeios</span>
                </div>
                <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-light">R$</span>
                    <span class="text-4xl font-bold">${total
                      .toFixed(2)
                      .replace(".", ",")}</span>
                </div>
                <p class="text-gray-500 text-xs mt-2">Saldo acumulado de passeios finalizados.</p>
            </div>
        `;
    } catch (e) {
      console.error("Erro ao carregar carteira:", e);
      return "";
    }
  },
};
