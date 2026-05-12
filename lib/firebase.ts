// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlLS6VX3zlEroZuHXKKHl45BrmRzM7u4c",
  authDomain: "salemate-c2736.firebaseapp.com",
  projectId: "salemate-c2736",
  storageBucket: "salemate-c2736.firebasestorage.app",
  messagingSenderId: "159868685167",
  appId: "1:159868685167:web:127074f18137120eb9769a",
  measurementId: "G-RYRNJ0ND6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();