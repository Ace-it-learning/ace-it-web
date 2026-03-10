import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// These keys are now configured with the user's project: ace-it-learning
const firebaseConfig = {
    apiKey: "AIzaSyA_agPkJIIW9k7gpIQcy_mG523bXgHnDec",
    authDomain: "ace-it-learning.firebaseapp.com",
    projectId: "ace-it-learning",
    storageBucket: "ace-it-learning.firebasestorage.app",
    messagingSenderId: "162154835481",
    appId: "1:162154835481:web:b29e09eabafdbbc1574488",
    measurementId: "G-ZQ77CNHBPD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
