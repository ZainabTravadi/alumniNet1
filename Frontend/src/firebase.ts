// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// (optional) import { getFirestore } from "firebase/firestore";
// (optional) import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyA8hNvQfDzVdJT3GZSpUnngbolnYgKNgnw",
  authDomain: "alumninet-auth.firebaseapp.com",
  projectId: "alumninet-auth",
  storageBucket: "alumninet-auth.appspot.com", // ✅ fixed earlier
  messagingSenderId: "616064143201",
  appId: "1:616064143201:web:4d770a83085f3671757f20",
  measurementId: "G-G56BGQFFTG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export only what you need
export const auth = getAuth(app);
// export const db = getFirestore(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);
