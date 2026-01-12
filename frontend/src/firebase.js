import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// These keys are now configured with the user's project: ace-it-ac129
const firebaseConfig = {
    apiKey: "AIzaSyCGtOY8L6jsWGFbPZGvCKGU4OOT9qWus-w",
    authDomain: "ace-it-ac129.firebaseapp.com",
    projectId: "ace-it-ac129",
    storageBucket: "ace-it-ac129.firebasestorage.app",
    messagingSenderId: "242153793328",
    appId: "1:242153793328:web:a958c7279e2aa87a344af5",
    measurementId: "G-H9GE29QBMD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
