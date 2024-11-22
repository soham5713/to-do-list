import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  authDomain: 'wrapitup-856e5.firebaseapp.com',
  projectId: 'wrapitup-856e5',
  storageBucket: 'wrapitup-856e5.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firestore methods for use in your components
export const getTasks = async () => {
  const querySnapshot = await getDocs(collection(db, 'tasks'));
  let tasks = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
};

export const addTask = async (task) => {
  await setDoc(doc(db, 'tasks', task.id), task);
};

export const updateTask = async (id, task) => {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, task);
};

export const deleteTask = async (id) => {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
};
