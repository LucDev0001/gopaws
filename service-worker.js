// Import scripts for Firebase Messaging (ajuste a versão se necessário)
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"
);

const CACHE_NAME = "gopaws-v2";
const urlsToCache = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Limpa caches antigos (v1)
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Assume o controle das abas abertas
  );
});

// --- FIREBASE MESSAGING ---
// Inicialize o Firebase no SW (Use as mesmas configs do firebase.js)
firebase.initializeApp({
  apiKey: "AIzaSyCV0IPWp1MftXTN2Sl2ZQDJzkmsehB_MWc",
  authDomain: "uberdog-6a203.firebaseapp.com",
  projectId: "uberdog-6a203",
  storageBucket: "uberdog-6a203.firebasestorage.app",
  messagingSenderId: "138601078764",
  appId: "1:138601078764:web:42be73dcb63d8207032ac9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customizar notificação aqui se necessário
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
