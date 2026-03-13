import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "*",
    authDomain: "gdg-cek.firebaseapp.com",
    projectId: "gdg-cek",
    storageBucket: "gdg-cek.firebasestorage.app",
    messagingSenderId: "86047449470",
    appId: "1:86047449470:web:1799f2aae1a9cd07dd532f",
    measurementId: "G-VZD2E1F2SM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);