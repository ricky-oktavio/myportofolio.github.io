/**
* Firebase Service for Ricky Oktavio Portfolio
* Manages Firebase initialization, Auth (Email/Password), and Firestore Database Sync.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// User's provided Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDXu_EGQHQHpx3PXlWSgcjktIoVcr2GwrY",
  authDomain: "my-portofolio-3cdc1.firebaseapp.com",
  projectId: "my-portofolio-3cdc1",
  storageBucket: "my-portofolio-3cdc1.firebasestorage.app",
  messagingSenderId: "151971377481",
  appId: "1:151971377481:web:4a59ed18f3515ced6c2a98",
  measurementId: "G-747VZ56GM4"
};

// Initialize Firebase App, Firestore, & Auth
let app = null;
let db = null;
let auth = null;
let isFirebaseReady = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseReady = true;
  console.log("🔥 Firebase App & Auth initialized for project:", firebaseConfig.projectId);
} catch (e) {
  console.warn("⚠️ Could not initialize Firebase, falling back to LocalStorage:", e);
}

export { db, auth, isFirebaseReady };

/**
 * Login admin using Firebase Authentication Email & Password
 */
export async function loginAdmin(email, password) {
  if (!isFirebaseReady || !auth) {
    throw new Error("Firebase Auth is not ready. Check your internet connection.");
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("🔑 Admin logged in successfully:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Login Error:", error.code, error.message);
    throw error;
  }
}

/**
 * Logout admin
 */
export async function logoutAdmin() {
  if (!isFirebaseReady || !auth) return;
  try {
    await signOut(auth);
    console.log("🔒 Admin logged out.");
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
}

/**
 * Auth state listener
 */
export function subscribeToAuthChanges(callback) {
  if (!isFirebaseReady || !auth) {
    // If Firebase isn't available, fallback
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Fetch portfolio data from Firestore or fallback to LocalStorage
 */
export async function getPortfolioDataFromFirebase() {
  if (!isFirebaseReady || !db) return null;

  try {
    const docRef = doc(db, "portfolio", "content");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("📥 Retrieved portfolio data from Firestore");
      return docSnap.data();
    } else {
      console.log("ℹ️ No Firestore document found.");
      return null;
    }
  } catch (err) {
    console.warn("⚠️ Firestore fetch warning:", err.message);
    return null;
  }
}

/**
 * Save portfolio data to Firestore
 */
export async function savePortfolioDataToFirebase(data) {
  if (!isFirebaseReady || !db) {
    console.warn("Firebase not ready. Data saved locally only.");
    return { success: false, reason: "NOT_READY" };
  }

  try {
    const docRef = doc(db, "portfolio", "content");
    await setDoc(docRef, data, { merge: true });
    console.log("☁️ Data successfully synced to Firestore!");
    return { success: true };
  } catch (err) {
    console.error("❌ Firestore Save Error:", err);
    if (err.code === "permission-denied" || err.message.includes("permission")) {
      return { 
        success: false, 
        reason: "PERMISSION_DENIED", 
        message: "Firestore Security Rules error. Make sure your Firestore Rules permit authenticated users or public test mode." 
      };
    }
    return { success: false, reason: "UNKNOWN", message: err.message };
  }
}

/**
 * Realtime listener for Firestore changes
 */
export function subscribeToFirebaseChanges(callback) {
  if (!isFirebaseReady || !db) return null;

  const docRef = doc(db, "portfolio", "content");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      console.log("⚡ Realtime update received from Firestore!");
      callback(docSnap.data());
    }
  }, (err) => {
    console.warn("Realtime listener error:", err.message);
  });
}
