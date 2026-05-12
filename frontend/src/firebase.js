import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

// Only initialize Firebase when Entra is NOT enabled.
// In Azure/Entra DEV environments, Firebase SDK is not used.
let auth = null;
let googleProvider = null;
let db = null;

if (!USE_ENTRA) {
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    // db is not initialized here; import from firebase/firestore directly if needed
}

export { auth, googleProvider, db };
