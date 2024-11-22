import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google login function (redirect method)
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, provider); // Use redirect instead of popup
  } catch (error) {
    console.error(error);
    throw new Error('Google Sign-In failed');
  }
};

// Handle result of the redirect method
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      console.log('Logged in user:', user);
      // Optionally, return the user or update UI
      return user;
    }
  } catch (error) {
    console.error(error);
  }
};

// Sign-out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};

// Fetch all tasks for the currently signed-in user
export const getTasksForUser = async (userId) => {
  const q = query(collection(db, "tasks"), orderBy("dueDate"));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs
    .map(doc => doc.data())
    .filter(task => task.userId === userId); // Filter tasks based on the user ID
  return tasks;
};

// Listen for real-time updates for the signed-in user
export const listenForTasks = (userId, callback) => {
  const unsubscribe = onSnapshot(
    query(collection(db, "tasks"), orderBy("dueDate")),
    (snapshot) => {
      const tasks = snapshot.docs
        .map(doc => doc.data())
        .filter(task => task.userId === userId); // Filter tasks based on the user ID
      callback(tasks);
    }
  );
  return unsubscribe;
};

// Add new task
export const addTask = async (task) => {
  try {
    await addDoc(collection(db, "tasks"), task);
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

// Update existing task
export const updateTask = async (id, updatedTask) => {
  try {
    const taskDoc = doc(db, "tasks", id);
    await updateDoc(taskDoc, updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    const taskDoc = doc(db, "tasks", id);
    await deleteDoc(taskDoc);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

export { auth };
