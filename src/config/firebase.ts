import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZHMejhhJD1LRJPLpdNuL67w_d2fS9USc",
  authDomain: "scheduling-258c6.firebaseapp.com",
  projectId: "scheduling-258c6",
  storageBucket: "scheduling-258c6.firebasestorage.app",
  messagingSenderId: "172604794143",
  appId: "1:172604794143:web:590284bc9ba9bdbd467c2a",
  measurementId: "G-F1FYJQG6KT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
