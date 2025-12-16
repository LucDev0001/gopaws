export function WalkRequestCard(request) {
  // Formata a data/hora de forma amigável
  const timeAgo = request.createdAt
    ? new Date(request.createdAt.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Agora";

  // Formatação de moeda
  const priceFormatted = request.price
    ? parseFloat(request.price).toFixed(2).replace(".", ",")
    : "0,00";

  return `
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-col gap-3 animate-fade-in">
        <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    🐕
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">${request.dogName}</h3>
                    <p class="text-sm text-gray-500">${request.tutorName} • ${
    request.duration || 30
  } min • ${timeAgo}</p>
                </div>
            </div>
            <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">R$ ${priceFormatted}</span>
        </div>
        
        <div class="text-sm text-gray-600 flex items-center gap-1">
            📍 ${request.address || "Localização via GPS"}
        </div>

        <button 
            onclick="window.acceptWalk('${request.id}')"
            class="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg">
            Aceitar Passeio
        </button>
    </div>
    `;
}
