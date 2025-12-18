let deferredPrompt = null;
const listeners = [];

// Escuta global do evento (iniciado assim que o módulo é importado)
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  listeners.forEach((cb) => cb(true));
});

export const pwaService = {
  /**
   * Verifica se a instalação está disponível no momento.
   */
  canInstall() {
    return !!deferredPrompt;
  },

  /**
   * Registra um callback para ser notificado quando a instalação estiver disponível.
   * Retorna uma função para remover o listener (cleanup).
   */
  onInstallable(callback) {
    listeners.push(callback);
    if (deferredPrompt) callback(true);

    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  async promptInstall() {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      deferredPrompt = null;
      return true;
    }
    return false;
  },
};
