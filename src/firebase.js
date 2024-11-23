import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBn7J79C1fCLhDv3dQ95RJa39Qf_IH-Au0",
  authDomain: "wrapitup-856e5.firebaseapp.com",
  projectId: "wrapitup-856e5",
  storageBucket: "wrapitup-856e5.firebasestorage.app",
  messagingSenderId: "992982213619",
  appId: "1:992982213619:web:214e848c8a7e8f23eca886",
  measurementId: "G-YW884D436J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
