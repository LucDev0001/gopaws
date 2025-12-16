import { dbService } from "../services/dbService.js";
import { auth } from "../services/firebase.js";

export class Chat {
  constructor(walkId) {
    this.walkId = walkId;
    this.unsubscribe = null;
  }

  // HTML estático para ser injetado na View
  static getHtml() {
    return `
            <!-- Botão Flutuante do Chat -->
            <button id="btn-toggle-chat" class="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg z-[1000] transition transform active:scale-95 text-2xl border border-gray-100">
                💬
            </button>

            <!-- Modal do Chat -->
            <div id="chat-modal" class="hidden fixed inset-0 bg-white z-[2000] flex flex-col">
                <header class="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
                    <h3 class="font-bold text-lg">Chat do Passeio 💬</h3>
                    <button id="btn-close-chat" class="text-white text-3xl font-bold leading-none hover:text-gray-300">&times;</button>
                </header>
                
                <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    <div class="flex justify-center mb-4">
                        <span class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">Início da conversa</span>
                    </div>
                </div>

                <form id="chat-form" class="p-3 bg-white border-t flex gap-2 pb-safe">
                    <input type="text" id="chat-input" class="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-black transition outline-none" placeholder="Digite uma mensagem..." autocomplete="off">
                    <button type="submit" class="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition">
                        ➤
                    </button>
                </form>
            </div>
        `;
  }

  init() {
    const modal = document.getElementById("chat-modal");
    const btnToggle = document.getElementById("btn-toggle-chat");
    const btnClose = document.getElementById("btn-close-chat");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const messagesContainer = document.getElementById("chat-messages");

    // Toggle Visibilidade
    const toggleChat = () => {
      modal.classList.toggle("hidden");
      if (!modal.classList.contains("hidden")) {
        this.scrollToBottom();
        input.focus();
      }
    };

    btnToggle.addEventListener("click", toggleChat);
    btnClose.addEventListener("click", toggleChat);

    // Enviar Mensagem
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      input.value = ""; // Limpa input imediatamente para melhor UX
      await dbService.sendMessage(this.walkId, text);
    });

    // Ouvir Mensagens em Tempo Real
    this.unsubscribe = dbService.listenToMessages(this.walkId, (messages) => {
      const user = auth.currentUser;
      // Mantém o header e adiciona as mensagens
      const headerHtml = `<div class="flex justify-center mb-4"><span class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">Início da conversa</span></div>`;

      const msgsHtml = messages
        .map((msg) => {
          const isMe = msg.senderId === user.uid;
          return `
                    <div class="flex ${isMe ? "justify-end" : "justify-start"}">
                        <div class="${
                          isMe
                            ? "bg-black text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                        } max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm">
                            ${msg.text}
                        </div>
                    </div>
                `;
        })
        .join("");

      messagesContainer.innerHTML = headerHtml + msgsHtml;
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    const container = document.getElementById("chat-messages");
    if (container) container.scrollTop = container.scrollHeight;
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
