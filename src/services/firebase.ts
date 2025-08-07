// services/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Configurações do Firebase — use variáveis de ambiente do Next.js
const firebaseConfig = {
  apiKey: "AIzaSyCWQOrbAFyL1x1bHELzzyrAlV9Ps6p-ImY",
  authDomain: "saude-mental-62d23.firebaseapp.com",
  projectId: "saude-mental-62d23",
  storageBucket: "saude-mental-62d23.firebasestorage.app",
  messagingSenderId: "552564407596",
  appId: "1:552564407596:web:f9ae6b9d2eedaee4cc0089",
  measurementId: "G-Z2NTHZ5D84"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "southamerica-east1"); // ajuste se sua região for diferente
