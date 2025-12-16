import { toastService } from "../utils/toastService.js";

export const PaymentModal = {
  getHtml(pixKey, whatsappNumber, price) {
    const safePrice = Number(price) || 0;
    const formattedPrice = `R$ ${safePrice.toFixed(2).replace(".", ",")}`;
    const whatsappLink = `https://wa.me/${(whatsappNumber || "").replace(
      /\D/g,
      ""
    )}?text=Olá! Segue o comprovante do passeio no valor de ${formattedPrice}.`;

    return `
      <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[3000] animate-fade-in">
        <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center m-4 relative">
          <button id="btn-close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          <div class="text-5xl mb-4">💳</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Realizar Pagamento</h2>
          <p class="text-gray-500 mb-6">O passeio foi finalizado. Pague o valor abaixo para o walker.</p>
          
          <div class="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
            <p class="text-xs text-gray-400 uppercase font-bold">Valor Total</p>
            <p class="text-4xl font-bold text-gray-900">${formattedPrice}</p>
          </div>

          <div class="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200 text-left">
            <p class="text-xs text-blue-800 uppercase font-bold mb-2">Chave PIX (CNPJ/Email/Tel)</p>
            <div class="flex items-center justify-between gap-2">
              <p class="text-blue-900 font-mono bg-blue-100 p-2 rounded-lg text-sm flex-1 truncate">${
                pixKey || "Não informada"
              }</p>
              <button id="btn-copy-pix" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold">Copiar</button>
            </div>
          </div>

          <a href="${whatsappLink}" target="_blank" class="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-green-600 transition">
            <span class="text-xl">✓</span> Enviar Comprovante
          </a>
          <p class="text-xs text-gray-400 mt-3">Você será redirecionado para o WhatsApp.</p>
        </div>
      </div>
    `;
  },

  init() {
    document.getElementById("btn-copy-pix").addEventListener("click", (e) => {
      const pixKey = e.target.previousElementSibling.innerText;
      navigator.clipboard.writeText(pixKey).then(() => {
        toastService.success("Chave PIX copiada!");
      });
    });

    document.getElementById("btn-close-modal").addEventListener("click", () => {
      const modal = document.getElementById("payment-modal");
      if (modal) modal.parentElement.remove();
    });
  },
};
