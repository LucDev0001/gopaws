// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCV0IPWp1MftXTN2Sl2ZQDJzkmsehB_MWc",
  authDomain: "uberdog-6a203.firebaseapp.com",
  projectId: "uberdog-6a203",
  storageBucket: "uberdog-6a203.firebasestorage.app",
  messagingSenderId: "138601078764",
  appId: "1:138601078764:web:42be73dcb63d8207032ac9",
  measurementId: "G-Y6X0VXEHRE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
