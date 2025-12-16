export const toastService = {
  /**
   * Exibe um toast na tela.
   * @param {string} message - Mensagem a ser exibida.
   * @param {'success'|'error'|'info'} type - Tipo da notificação.
   */
  show(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed top-4 right-4 z-50 flex flex-col gap-2";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const colors = {
      success: "bg-green-500 border-green-600",
      error: "bg-red-500 border-red-600",
      info: "bg-blue-500 border-blue-600",
    };
    const icons = {
      success: "✅",
      error: "⚠️",
      info: "ℹ️",
    };

    // Classes do Tailwind para estilo e animação
    toast.className = `${colors[type]} text-white px-4 py-3 rounded shadow-lg border-l-4 flex items-center gap-3 min-w-[300px] transition-all duration-500 transform translate-x-0`;
    toast.innerHTML = `
      <span class="text-lg">${icons[type]}</span>
      <p class="font-medium text-sm">${message}</p>
    `;

    container.appendChild(toast);

    // Remove automaticamente após 4 segundos
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-full");
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  },

  success(msg) {
    this.show(msg, "success");
  },
  error(msg) {
    this.show(msg, "error");
  },
  info(msg) {
    this.show(msg, "info");
  },
};
