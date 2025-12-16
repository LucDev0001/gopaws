import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const authService = {
  async register(email, password, userData) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.name });

    // Cria o perfil no Firestore com o papel correto (manager ou tutor)
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email: email,
      createdAt: new Date(),
      // Managers são auto-verificados no MVP, Walkers precisam de aprovação
      isVerified: userData.role === "manager" ? true : false,
    });

    return user;
  },

  async login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async logout() {
    return await signOut(auth);
  },
};
