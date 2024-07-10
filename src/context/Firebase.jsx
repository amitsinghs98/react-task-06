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
  updateDoc,
  doc,
  getDoc,
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
// const signupUserWithEmailAndPassword = (email, password) =>
//   createUserWithEmailAndPassword(firebaseAuth, email, password);
//fetch ip
const fetchIPAddress = async () => {
  try {
    // Replace with actual logic to fetch IP address dynamically (e.g., using a service)
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address: ", error);
    throw error;
  }
};
// Function to sign up user with email and password

const signupUserWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const user = userCredential.user;

    // Get IP address of user (replace with actual logic to fetch IP dynamically)
    const ipAddress = await fetchIPAddress(); // Function to fetch IP address dynamically

    // Add user data to Firestore
    const usersRef = collection(firestore, "users");
    await addDoc(usersRef, {
      userId: user.uid,
      userEmail: user.email,
      userIp: ipAddress,
      createdAt: new Date(),
    });
    console.log("User created successfully");

    return user;
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error; // Propagate the error back to the caller
  }
};

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
      tasks: [], // Initialize tasks as an empty array
      createdAt: new Date(),
    });
    console.log("Todo created successfully");
  } catch (error) {
    console.error("Error creating todo: ", error);
  }
};

// Function to handle adding a new task to a todo
const handleAddTask = async (
  todoId,
  title,
  description,
  date,
  priority,
  createdAt,
  callback // Callback function to update state with updated todos
) => {
  try {
    // Ensure required fields are defined
    if (!todoId || !title || !description || !date || !priority) {
      throw new Error("One or more task fields are undefined.");
    }

    // Get the document reference for the todo
    const todoDocRef = doc(firestore, "todos", todoId);
    const todoSnapshot = await getDoc(todoDocRef);
    if (!todoSnapshot.exists()) {
      throw new Error("Todo does not exist."); // Handle if todoId is invalid
    }

    // Get current tasks array or initialize it if it doesn't exist
    const tasks = todoSnapshot.data().tasks || [];

    // Construct the new task object
    const newTask = {
      title: title,
      description: description,
      date: date,
      priority: priority,
      createdAt: new Date(),
    };

    // Update tasks array with the new task
    const updatedTasks = [...tasks, newTask];

    // Update Firestore document with the updated tasks array
    await updateDoc(todoDocRef, {
      tasks: updatedTasks,
    });

    console.log("Task added successfully");

    // If callback function is provided, invoke it with updated todos
    if (typeof callback === "function") {
      const updatedTodos = await listTodos(); // Fetch updated todos
      callback(updatedTodos); // Update state with updated todos
    }
  } catch (error) {
    console.error("Error adding task: ", error);
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
        handleAddTask: (todoId, title, description, date, priority, callback) =>
          handleAddTask(todoId, title, description, date, priority, callback),
        signout,
        listTodos: () => listTodos(user), // Call listTodos with user context
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
