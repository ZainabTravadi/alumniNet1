import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Web Config (SAFE for frontend)
const firebaseConfig = {
  apiKey: "AIzaSyATrc7B5Sz-ZLV0S2IVhUa2vheW_iv9Bgk",
  authDomain: "alumninet-16d17.firebaseapp.com",
  projectId: "alumninet-16d17",
  storageBucket: "alumninet-16d17.firebasestorage.app",
  messagingSenderId: "514512179337",
  appId: "1:514512179337:web:e721b50f63bd562c6eb658",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
