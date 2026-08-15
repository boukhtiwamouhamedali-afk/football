"use client";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPFCbghOyCKW3G9-g7WwepgRCawPIjbJc",
  authDomain: "football-team-629d1.firebaseapp.com",
  projectId: "football-team-629d1",
  storageBucket: "football-team-629d1.firebasestorage.app",
  messagingSenderId: "1794928907",
  appId: "1:1794928907:web:60dcb8566b6b9e6775720e",
  measurementId: "G-D32HGBMFV3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);