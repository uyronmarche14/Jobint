// firebaseConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8vlkckj4wWgRm_NvOrSmnoik5mm8oydo",
  authDomain: "jobinthelper.firebaseapp.com",
  projectId: "jobinthelper",
  storageBucket: "jobinthelper.appspot.com",
  messagingSenderId: "480106939932",
  appId: "1:480106939932:web:ae1a2e4e3846fa28fbc1d9",
  measurementId: "G-TM1FJ2XS2R"
};


// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistent storage using AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Realtime Database and Storage
export const db = getDatabase(app);
export const storage = getStorage(app);


