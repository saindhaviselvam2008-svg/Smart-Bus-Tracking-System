import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDNP8eyEKARlpfLXgs-e6qpCXhLKuBGA5Y",
  authDomain: "bus-tracking-827b5.firebaseapp.com",
  databaseURL: "https://bus-tracking-827b5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bus-tracking-827b5",
  storageBucket: "bus-tracking-827b5.firebasestorage.app",
  messagingSenderId: "730464879724",
  appId: "1:730464879724:web:0523f11e221b8a3286c449"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
