// Firebase.js

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
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

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

// Function to handle creating a new todo
const handleCreateNewTodo = async (listName, user) => {
  try {
    const todoRef = collection(firestore, "todos");
    await addDoc(todoRef, {
      listName,
      userId: user.uid, // Associate todo with user's ID
      userEmail: user.email,
      displayName: user.displayName || "Anonymous",
      createdAt: new Date(),
    });
    console.log("Todo created successfully");
  } catch (error) {
    console.error("Error creating todo: ", error);
  }
};

// Function to list todos for the authenticated user
const listTodos = async (user) => {
  try {
    if (!user) return []; // Return empty array if user is not authenticated

    const todosRef = collection(firestore, "todos");
    const q = query(todosRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching todos: ", error);
    return [];
  }
};

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

  const signout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null); // Clear user state on logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPass,
        signinWithGoogle,
        isLoggedIn,
        handleCreateNewTodo: (listName) => handleCreateNewTodo(listName, user),
        signout,
        listTodos: () => listTodos(user), // Call listTodos with user context
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
