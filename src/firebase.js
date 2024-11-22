import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';

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

// Set authentication persistence to local to stay logged in after page refresh
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error('Error setting persistence:', error));

// Google login function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user; // Return user information
  } catch (error) {
    console.error(error);
    throw new Error('Google Sign-In failed');
  }
};

// Sign-out function
export const signOutUser = async () => {
  await signOut(auth);
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
  // Make sure to include the userId (firebase user UID)
  const taskWithUser = { ...task, userId: auth.currentUser.uid };
  await addDoc(collection(db, "tasks"), taskWithUser);
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

// Check if user is logged in and provide the user's UID
export const getCurrentUser = () => {
  return auth.currentUser; // Returns null if the user is not logged in
};

export { auth };
