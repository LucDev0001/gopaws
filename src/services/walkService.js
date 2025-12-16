import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  orderBy,
  getDoc,
} from "firebase/firestore";

export const walkService = {
  // TUTOR: Cria uma solicitação de passeio
  async createRequest(petData, address) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const docRef = await addDoc(collection(db, "open_requests"), {
      tutorId: user.uid,
      tutorName: user.displayName || "Tutor",
      dogName: petData.name,
      dogPhoto: petData.photo,
      dogId: petData.id,
      price: petData.estimatedPrice,
      duration: petData.duration,
      address: address,
      paymentStatus: "pending",
      status: "pending",
      createdAt: serverTimestamp(),
      location: null,
    });
    return docRef.id;
  },

  // WALKER: Aceita um passeio (Atomicamente)
  async acceptRequest(requestId) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    // 1. Buscar dados do Walker para pegar o managerId (Vínculo com Pet Shop)
    const walkerDoc = await getDoc(doc(db, "users", user.uid));
    const walkerData = walkerDoc.exists() ? walkerDoc.data() : {};

    const requestRef = doc(db, "open_requests", requestId);
    const newWalkRef = doc(collection(db, "walks"));

    try {
      await runTransaction(db, async (transaction) => {
        const requestDoc = await transaction.get(requestRef);
        if (!requestDoc.exists()) throw new Error("Pedido não existe mais.");

        const data = requestDoc.data();
        if (data.status !== "pending")
          throw new Error("Este passeio já foi aceito por outro walker.");

        // 2. Cria o documento oficial do passeio (Walk)
        transaction.set(newWalkRef, {
          ...data,
          walkerId: user.uid,
          walkerName: user.displayName || "Walker",
          managerId: walkerData.managerId || null, // Salva o ID do Pet Shop
          status: "accepted", // Status inicial antes de começar a andar
          startTime: null,
          requestId: requestId,
        });

        // 3. Atualiza o pedido com o ID do novo passeio (CRÍTICO PARA O TUTOR)
        transaction.update(requestRef, {
          status: "accepted",
          walkerId: user.uid,
          walkId: newWalkRef.id, // <--- O Tutor precisa disso para redirecionar
        });
      });
      return newWalkRef.id;
    } catch (e) {
      console.error("Erro na transação:", e);
      throw e;
    }
  },

  // WALKER: Escuta pedidos em tempo real
  listenToOpenRequests(onNext, onError) {
    const q = query(
      collection(db, "open_requests"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onNext(requests);
      },
      (error) => {
        if (onError) onError(error);
        else console.error("Erro no listener de pedidos:", error);
      }
    );
  },
};
