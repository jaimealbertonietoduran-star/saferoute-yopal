import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "saferoute-yopal.firebaseapp.com",
  projectId: "saferoute-yopal",
  storageBucket: "saferoute-yopal.firebasestorage.app",
  messagingSenderId: "606384684187",
  appId: "1:606384684187:web:299526389eec657a681a3e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
