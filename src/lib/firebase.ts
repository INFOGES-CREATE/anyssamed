// ============================================================
// 📁 src/lib/firebase.ts
// ============================================================
// 🔥 Configuración central de Firebase para MediSuite Pro
// Adaptada para Next.js (cliente + servidor) — Versión 2025
// ============================================================
//
// Incluye inicialización única (previene múltiples instancias),
// integración con los servicios principales:
//
// ⚙️ Firebase App
// 🔐 Firebase Auth
// 💾 Firestore Database
// 🗂️ Cloud Storage
//
// Compatible con Next.js App Router y Server Components.
// ============================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ============================================================
// ⚙️ Configuración de Firebase usando variables de entorno (.env.local)
// ============================================================
//
// ⚠️ IMPORTANTE: Todos los valores deben definirse en tu archivo `.env.local`.
// Ejemplo:
//
// NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...tu_clave
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=anyssamed.firebaseapp.com
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=anyssamed
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=anyssamed.appspot.com
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
// NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef1234567890
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
//
// ============================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// ============================================================
// 🧩 Inicialización segura (previene reinicialización en Hot Reload)
// ============================================================
//
// En entornos de desarrollo con Next.js, el sistema recarga el código
// en caliente (hot reload). Esto puede causar errores de inicialización
// si Firebase se ejecuta más de una vez.
//
// La siguiente línea garantiza que Firebase solo se inicialice una vez.
//

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ============================================================
// 🔐 Exportación de los servicios principales de Firebase
// ============================================================
//
// db       → Base de datos Firestore
// auth     → Módulo de autenticación (email, Google, etc.)
// storage  → Almacenamiento en la nube (imágenes, archivos, etc.)
// app      → Instancia principal de Firebase (por defecto)
// ============================================================

export const db = getFirestore(app);       // Firestore Database
export const auth = getAuth(app);          // Firebase Authentication
export const storage = getStorage(app);    // Cloud Storage

export default app;
