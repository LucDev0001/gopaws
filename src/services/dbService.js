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
  runTransaction,
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
  async confirmPayment(walkId, paymentMethod, price, tutorId) {
    await runTransaction(db, async (transaction) => {
      const walkRef = doc(db, "walks", walkId);

      // Se for pagamento via SALDO, deduzir do Tutor
      if (paymentMethod === "balance") {
        const tutorRef = doc(db, "users", tutorId);
        const tutorDoc = await transaction.get(tutorRef);
        if (!tutorDoc.exists()) throw new Error("Tutor não encontrado");

        const currentBalance = Number(tutorDoc.data().balance || 0);
        const cost = Number(price);

        if (currentBalance < cost) throw new Error("Saldo insuficiente.");

        transaction.update(tutorRef, { balance: currentBalance - cost });
      }

      transaction.update(walkRef, {
        status: "completed",
        paymentStatus: "paid",
      });
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
    const walks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      // Filtra itens deletados pelo usuário específico
      .filter((w) =>
        role === "walker" ? !w.deletedByWalker : !w.deletedByTutor
      );

    // Ordenação em memória por data (mais recente primeiro)
    return walks.sort((a, b) => {
      const tA = a.startTime ? a.startTime.seconds : 0;
      const tB = b.startTime ? b.startTime.seconds : 0;
      return tB - tA;
    });
  },

  // Ocultar histórico (Soft Delete)
  async hideWalkHistory(walkId, role) {
    const ref = doc(db, "walks", walkId);
    const field = role === "walker" ? "deletedByWalker" : "deletedByTutor";
    await updateDoc(ref, { [field]: true });
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
      where("role", "==", "manager")
      // orderBy("createdAt", "desc") // Removido para evitar erro de índice no MVP
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

  // NOTIFICAÇÕES: Salvar Token FCM do dispositivo
  async saveFCMToken(userId, token) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      fcmToken: token,
      lastLogin: serverTimestamp(),
    });
  },

  // WALKER: Alternar Status Online/Offline
  async toggleWalkerStatus(userId, isActive) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { isActive: isActive });
  },

  // --- CARTEIRA / FINANCEIRO ---

  // TUTOR: Criar intenção de depósito
  async createDepositRequest(tutorId, managerId, amount) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    await addDoc(collection(db, "wallet_transactions"), {
      tutorId: user.uid, // Garante consistência com regras de segurança
      managerId,
      amount: Number(amount),
      type: "deposit",
      status: "pending",
      createdAt: serverTimestamp(),
    });
  },

  // MANAGER: Aprovar depósito (Adiciona saldo ao Tutor)
  async approveDeposit(transactionId) {
    await runTransaction(db, async (transaction) => {
      const transRef = doc(db, "wallet_transactions", transactionId);
      const transDoc = await transaction.get(transRef);

      if (!transDoc.exists()) throw new Error("Transação não encontrada");
      const data = transDoc.data();
      if (data.status !== "pending") throw new Error("Transação já processada");

      const tutorRef = doc(db, "users", data.tutorId);
      const tutorDoc = await transaction.get(tutorRef);

      const currentBalance = tutorDoc.exists()
        ? Number(tutorDoc.data().balance || 0)
        : 0;
      const newBalance = currentBalance + Number(data.amount);

      // 1. Atualiza saldo do Tutor
      transaction.update(tutorRef, { balance: newBalance });

      // 2. Marca transação como concluída
      transaction.update(transRef, {
        status: "completed",
        approvedAt: serverTimestamp(),
      });
    });
  },

  // MANAGER: Rejeitar depósito
  async rejectDeposit(transactionId) {
    const ref = doc(db, "wallet_transactions", transactionId);
    await updateDoc(ref, { status: "rejected" });
  },

  // TUTOR: Buscar histórico da carteira
  async getWalletHistory(userId) {
    // Busca depósitos
    const q = query(
      collection(db, "wallet_transactions"),
      where("tutorId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // TUTOR: Ler saldo atual (Helper rápido, mas ideal é ler do userDoc no init)
  async getBalance(userId) {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? Number(snap.data().balance || 0) : 0;
  },
};
