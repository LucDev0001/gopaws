import { db, auth } from "./firebase.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

export const dbService = {
  // Inicia o passeio mudando status e timestamp
  async startWalk(walkId) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      status: "ongoing",
      startTime: Timestamp.now(),
    });
  },

  // Atualiza localização (chamado pelo GPS)
  async updateLocation(walkId, lat, lng) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      path: arrayUnion({ lat, lng, timestamp: Timestamp.now() }),
      lastLocation: { lat, lng },
    });
  },

  // Registra eventos (Xixi/Cocô)
  async addEvent(walkId, type, lat, lng) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      events: arrayUnion({ type, lat, lng, time: Timestamp.now() }),
    });
  },

  // SOS: Enviar alerta de pânico
  async sendSOS(walkId) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      sos: true,
      events: arrayUnion({ type: "SOS", time: Timestamp.now() }),
    });
  },

  async finishWalk(walkId) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      status: "payment_pending",
      endTime: Timestamp.now(),
    });
  },

  // Confirma o pagamento e finaliza o ciclo
  async confirmPayment(walkId) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      status: "completed",
      paymentStatus: "paid",
    });
  },

  // Avaliar o passeio (Walker avalia o cão)
  async rateWalk(walkId, rating) {
    const ref = doc(db, "walks", walkId);
    await updateDoc(ref, {
      rating: rating,
      ratedAt: Timestamp.now(),
    });
  },

  // Buscar histórico de passeios do usuário
  async getUserWalks(userId, role) {
    const field = role === "walker" ? "walkerId" : "tutorId";
    const q = query(collection(db, "walks"), where(field, "==", userId));

    const snapshot = await getDocs(q);
    const walks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Ordenação em memória por data (mais recente primeiro)
    return walks.sort((a, b) => {
      const tA = a.startTime ? a.startTime.seconds : 0;
      const tB = b.startTime ? b.startTime.seconds : 0;
      return tB - tA;
    });
  },

  // CHAT: Enviar mensagem
  async sendMessage(walkId, text) {
    const user = auth.currentUser;
    await addDoc(collection(db, "walks", walkId, "messages"), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
  },

  // CHAT: Ouvir mensagens
  listenToMessages(walkId, callback) {
    const q = query(
      collection(db, "walks", walkId, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  },

  // PETS: Adicionar Pet
  async addPet(petData) {
    const user = auth.currentUser;
    await addDoc(collection(db, "dogs"), {
      ...petData,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  },

  // PETS: Listar Pets do Dono
  async getUserPets(userId) {
    const q = query(collection(db, "dogs"), where("ownerId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Buscar configuração de preço (Do primeiro gerente encontrado - MVP)
  async getPricing() {
    const q = query(
      collection(db, "users"),
      where("role", "==", "manager"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().pricing;
    }
    return null;
  },

  // ADMIN: Buscar todos os managers
  async getAllManagers() {
    const q = query(
      collection(db, "users"),
      where("role", "==", "manager"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // ADMIN: Buscar usuários por role
  async getUsersByRole(role) {
    const q = query(
      collection(db, "users"),
      where("role", "==", role),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // ADMIN: Banir usuário
  async banUser(userId) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      isBanned: true,
      isActive: false,
    });
  },

  // ADMIN: Aprovar assinatura
  async approveSubscription(userId) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      isSubscriptionPaid: true,
      subscriptionPaidAt: Timestamp.now(),
    });
  },

  // FAVORITOS: Alternar (Adicionar/Remover)
  async toggleFavorite(targetId) {
    const user = auth.currentUser;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const favorites = snap.data().favorites || [];

    if (favorites.includes(targetId)) {
      await updateDoc(ref, { favorites: arrayRemove(targetId) });
      return false; // Removido
    } else {
      await updateDoc(ref, { favorites: arrayUnion(targetId) });
      return true; // Adicionado
    }
  },

  // FAVORITOS: Buscar detalhes dos usuários favoritados
  async getFavorites() {
    const user = auth.currentUser;
    const snap = await getDoc(doc(db, "users", user.uid));
    const ids = snap.data().favorites || [];
    if (ids.length === 0) return [];

    // Busca os dados de cada favorito (Nome, Foto, etc)
    const promises = ids.map((id) => getDoc(doc(db, "users", id)));
    const docs = await Promise.all(promises);
    return docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
