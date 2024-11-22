import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBn7J79C1fCLhDv3dQ95RJa39Qf_IH-Au0",
    authDomain: "wrapitup-856e5.firebaseapp.com",
    projectId: "wrapitup-856e5",
    storageBucket: "wrapitup-856e5.firebasestorage.app",
    messagingSenderId: "992982213619",
    appId: "1:992982213619:web:214e848c8a7e8f23eca886",
    measurementId: "G-YW884D436J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch all tasks
export const getTasks = async () => {
  const q = query(collection(db, "tasks"), orderBy("dueDate"));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map(doc => doc.data());
  return tasks;
};

// Listen for real-time updates
export const listenForTasks = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data());
    callback(tasks);
  });
  return unsubscribe;
};

// Add new task
export const addTask = async (task) => {
  await addDoc(collection(db, "tasks"), task);
};

// Update existing task
export const updateTask = async (id, updatedTask) => {
  const taskDoc = doc(db, "tasks", id);
  await updateDoc(taskDoc, updatedTask);
};

// Delete task
export const deleteTask = async (id) => {
  const taskDoc = doc(db, "tasks", id);
  await deleteDoc(taskDoc);
};
