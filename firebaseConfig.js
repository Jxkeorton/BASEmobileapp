import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth, } from "firebase/auth";
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC2Y25PYBRR0m6p7ekOmuLoYLLnXiS9mJM",
  authDomain: "uk-base-map.firebaseapp.com",
  databaseURL: "https://uk-base-map-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "uk-base-map",
  storageBucket: "uk-base-map.appspot.com",
  messagingSenderId: "899524901759",
  appId: "1:899524901759:web:4d8d337a395ee41b5ef84a"
};


// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence : getReactNativePersistence(AsyncStorage)
});

export { FIREBASE_APP, FIREBASE_DB, FIREBASE_STORAGE, FIREBASE_AUTH };

// for google auth at a later date
// ios : 899524901759-hm1ombkd3uf9osvq5dosb5jfad9gl8ai.apps.googleusercontent.com
// android : 899524901759-g7hmsmsk749u9fkp3l40il18cg7139uq.apps.googleusercontent.com
