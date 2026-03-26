import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzdkwlh9dmMl0qCVYB4-vnsRdvAmnDxdc",
  authDomain: "crowfunding-46eba.firebaseapp.com",
  projectId: "crowfunding-46eba",
  storageBucket: "crowfunding-46eba.firebasestorage.app",
  messagingSenderId: "593695319988",
  appId: "1:593695319988:web:b032bcc796a7e9873074e1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
