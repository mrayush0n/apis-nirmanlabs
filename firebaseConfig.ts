
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC2Xnvf6hpTbJtF21iXniUdVz2XH8PcKmI",
    authDomain: "apis-nirman.firebaseapp.com",
    projectId: "apis-nirman",
    storageBucket: "apis-nirman.firebasestorage.app",
    messagingSenderId: "387874072759",
    appId: "1:387874072759:web:68090ea3dd74cee7108532",
    measurementId: "G-XH2Z8YNJWC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

