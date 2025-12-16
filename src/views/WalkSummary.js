import { db, auth } from "../services/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { navigateTo } from "../router/router.js";
import { dbService } from "../services/dbService.js";
import { toastService } from "../utils/toastService.js";

export default {
  async getHtml() {
    return `
      <div class="h-full flex flex-col bg-gray-50">
        <header class="bg-white p-6 shadow-sm flex items-center gap-4">
            <button onclick="window.history.back()" class="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-800">Resumo do Passeio</h1>
        </header>
        <div id="summary-content" class="flex-1 overflow-y-auto p-6 space-y-6">
            <div class="animate-pulse flex flex-col gap-4">
                <div class="h-48 bg-gray-200 rounded-2xl"></div>
                <div class="h-24 bg-gray-200 rounded-2xl"></div>
            </div>
        </div>
      </div>
    `;
  },
  async init() {
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const walkId = urlParams.get("id");
    if (!walkId) return navigateTo("/");

    const docRef = doc(db, "walks", walkId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return navigateTo("/");
    const data = snap.data();
    const user = auth.currentUser;

    // Calcular Estatísticas
    const events = data.events || [];
    const peeCount = events.filter((e) => e.type === "pee").length;
    const pooCount = events.filter((e) => e.type === "poo").length;

    let distance = 0;
    if (data.path && data.path.length > 1) {
      for (let i = 0; i < data.path.length - 1; i++) {
        const p1 = L.latLng(data.path[i].lat, data.path[i].lng);
        const p2 = L.latLng(data.path[i + 1].lat, data.path[i + 1].lng);
        distance += p1.distanceTo(p2);
      }
    }
    const distKm = (distance / 1000).toFixed(2);

    const container = document.getElementById("summary-content");
    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div id="summary-map" class="h-48 w-full bg-gray-100 z-0"></div>
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-bold text-lg text-gray-800">${
                      data.dogName
                    }</h2>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">${
                      data.status
                    }</span>
                </div>
                <p class="text-sm text-gray-500">Walker: ${data.walkerName}</p>
                <p class="text-xs text-gray-400 mt-1">${new Date(
                  data.createdAt.seconds * 1000
                ).toLocaleString()}</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-100">
                <div class="text-2xl mb-1">📏</div>
                <div class="font-bold text-gray-800">${distKm} km</div>
                <div class="text-xs text-gray-400">Distância</div>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-100">
                <div class="text-2xl mb-1">🟡</div>
                <div class="font-bold text-gray-800">${peeCount}</div>
                <div class="text-xs text-gray-400">Xixis</div>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-100">
                <div class="text-2xl mb-1">💩</div>
                <div class="font-bold text-gray-800">${pooCount}</div>
                <div class="text-xs text-gray-400">Cocôs</div>
            </div>
        </div>

        <!-- Avaliação (Apenas Tutor e se não avaliado) -->
        ${
          user.uid === data.tutorId && !data.rating
            ? `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center" id="rating-card">
            <h3 class="font-bold text-gray-800 mb-2">Como foi o passeio?</h3>
            <p class="text-sm text-gray-500 mb-4">Avalie o serviço de ${data.walkerName}</p>
            <div class="flex justify-center gap-2 text-3xl mb-4" id="stars-container">
                <button class="star-btn hover:scale-110 transition" data-value="1">☆</button>
                <button class="star-btn hover:scale-110 transition" data-value="2">☆</button>
                <button class="star-btn hover:scale-110 transition" data-value="3">☆</button>
                <button class="star-btn hover:scale-110 transition" data-value="4">☆</button>
                <button class="star-btn hover:scale-110 transition" data-value="5">☆</button>
            </div>
            <button id="btn-submit-rating" class="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50" disabled>Enviar Avaliação</button>
        </div>
        `
            : ""
        }

        ${
          data.rating
            ? `
        <div class="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
            <p class="text-yellow-800 font-bold">Passeio Avaliado</p>
            <div class="text-2xl mt-1">${"⭐".repeat(data.rating)}</div>
        </div>
        `
            : ""
        }
    `;

    // Inicializar Mapa Estático
    if (data.path && data.path.length > 0) {
      const map = L.map("summary-map", {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );
      const latLngs = data.path.map((p) => [p.lat, p.lng]);
      const polyline = L.polyline(latLngs, { color: "blue", weight: 4 }).addTo(
        map
      );
      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }

    // Lógica de Avaliação
    if (user.uid === data.tutorId && !data.rating) {
      let selectedRating = 0;
      const stars = document.querySelectorAll(".star-btn");
      const btnSubmit = document.getElementById("btn-submit-rating");

      stars.forEach((star) => {
        star.addEventListener("click", () => {
          selectedRating = parseInt(star.dataset.value);
          btnSubmit.disabled = false;
          // Atualiza visual
          stars.forEach((s) => {
            s.innerText =
              parseInt(s.dataset.value) <= selectedRating ? "⭐" : "☆";
            s.classList.toggle(
              "text-yellow-500",
              parseInt(s.dataset.value) <= selectedRating
            );
          });
        });
      });

      btnSubmit.addEventListener("click", async () => {
        try {
          btnSubmit.disabled = true;
          btnSubmit.innerText = "Enviando...";
          await dbService.rateWalk(walkId, selectedRating);
          toastService.success("Avaliação enviada!");
          setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
          toastService.error(e.message);
        }
      });
    }
  },
};
