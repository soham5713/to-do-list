import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBn7J79C1fCLhDv3dQ95RJa39Qf_IH-Au0",
    authDomain: "wrapitup-856e5.firebaseapp.com",
    projectId: "wrapitup-856e5",
    storageBucket: "wrapitup-856e5.firebasestorage.app",
    messagingSenderId: "992982213619",
    appId: "1:992982213619:web:214e848c8a7e8f23eca886",
    measurementId: "G-YW884D436J",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch tasks
export const getTasks = async () => {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    let tasks = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
};

// Add task
export const addTask = async (task) => {
    await setDoc(doc(db, 'tasks', task.id), task);
};

// Update task
export const updateTask = async (id, task) => {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, task);
};

// Delete task
export const deleteTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
};

// Real-time listener for tasks
export const listenForTasks = (callback) => {
    const tasksRef = collection(db, 'tasks');
    return onSnapshot(tasksRef, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
    });
};

const tasksRef = collection(db, 'tasks');
onSnapshot(tasksRef, (snapshot) => {
  if (!snapshot || !snapshot.docs) {
    console.error('Snapshot or docs are undefined');
    return;
  }

  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  callback(tasks);
});