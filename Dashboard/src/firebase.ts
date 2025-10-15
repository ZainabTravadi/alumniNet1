// C:\Users\DELL\Desktop\alumniNet1\Frontend\src\firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 💡 Add the necessary imports for Authentication and Firestore
import { getAuth, Auth } from "firebase/auth"; 
import { getFirestore, Firestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATrc7B5Sz-ZLV0S2IVhUa2vheW_iv9Bgk",
  authDomain: "alumninet-16d17.firebaseapp.com",
  projectId: "alumninet-16d17",
  storageBucket: "alumninet-16d17.firebasestorage.app",
  messagingSenderId: "514512179337",
  appId: "1:514512179337:web:e721b50f63bd562c6eb658",
  measurementId: "G-TNS2THDG88"
};

// Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize and EXPORT the services your components need
// This fixes the "Module has no exported member 'auth'" error.
export const auth: Auth = getAuth(app); 
export const db: Firestore = getFirestore(app); 

// Initialize and export other services if needed
export const analytics = getAnalytics(app);

export default app;