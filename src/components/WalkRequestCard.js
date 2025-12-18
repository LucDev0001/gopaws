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

  // Link do Google Maps
  const encodedAddress = encodeURIComponent(request.address || "");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return `
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-col gap-3 animate-fade-in">
        <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                    ${
                      request.dogPhoto
                        ? `<img src="${request.dogPhoto}" class="w-full h-full object-cover">`
                        : "🐕"
                    }
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">${request.dogName}</h3>
                    <p class="text-sm text-gray-500">${request.tutorName}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">R$ ${priceFormatted}</span>
                <p class="text-[10px] text-gray-400 mt-1">${timeAgo}</p>
            </div>
        </div>
        
        <div class="bg-gray-50 p-3 rounded-xl space-y-2">
            <div class="flex justify-between items-start">
                <div class="text-xs text-gray-600 flex items-start gap-2 max-w-[70%]">
                    <span>📍</span> <span class="font-medium">${
                      request.address || "Localização via GPS"
                    }</span>
                </div>
                <a href="${mapsUrl}" target="_blank" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                    🗺️ Rota
                </a>
            </div>
            
            ${
              request.dogObservations && request.dogObservations !== "Nenhuma"
                ? `<div class="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium flex items-start gap-1"><span>⚠️</span> ${request.dogObservations}</div>`
                : ""
            }

            <div class="text-xs text-gray-600 flex items-center gap-2">
                <span>📞</span> <span class="font-medium">${
                  request.tutorPhone || "Sem telefone"
                }</span>
            </div>
            <div class="text-xs text-gray-600 flex items-center gap-2">
                <span>⏱️</span> <span class="font-medium">Duração: ${
                  request.duration || 30
                } min</span>
            </div>
        </div>

        <button 
            onclick="window.acceptWalk('${request.id}')"
            class="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg">
            Aceitar Passeio
        </button>
    </div>
    `;
}
