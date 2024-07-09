import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

// Create a context for Firebase
const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyBoOZlRQdaUPcKFunGBfu4DbfXu-jJF7Z8",
  authDomain: "todo-app-719e2.firebaseapp.com",
  databaseURL: "https://todo-app-719e2-default-rtdb.firebaseio.com",
  projectId: "todo-app-719e2",
  storageBucket: "todo-app-719e2.appspot.com",
  messagingSenderId: "936949043152",
  appId: "1:936949043152:web:7d69357d6a1cdea15af3d5",
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get Firebase auth instance
const firebaseAuth = getAuth(firebaseApp);

// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();

// Function to sign up user with email and password
const signupUserWithEmailAndPassword = (email, password) =>
  createUserWithEmailAndPassword(firebaseAuth, email, password);

// Function to sign in user with email and password
const signinUserWithEmailAndPass = (email, password) =>
  signInWithEmailAndPassword(firebaseAuth, email, password);

// Function to sign in with Google
const signinWithGoogle = () => signInWithPopup(firebaseAuth, googleProvider);

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Firebase provider component
export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;

  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPass,
        signinWithGoogle,
        isLoggedIn,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
