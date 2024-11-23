import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase Configuration
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

const App = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [sortOrderDate, setSortOrderDate] = useState("asc"); // for date sorting
  const [sortOrderPriority, setSortOrderPriority] = useState("asc"); // for priority sorting

  // Login with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTasks([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Sync tasks with Firestore
  const syncTasks = async (uid) => {
    const docRef = doc(db, "users", uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTasks(docSnap.data().tasks || []);
      } else {
        await setDoc(docRef, { tasks: [] });
      }
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  };

  const updateFirestoreTasks = async (uid, updatedTasks) => {
    const docRef = doc(db, "users", uid);
    try {
      await updateDoc(docRef, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating tasks in Firestore:", error);
    }
  };

  // Add or Update Task
  const addOrUpdateTask = () => {
    if (!newTask) return;
    const updatedTasks = [...tasks];
    if (editIndex !== null) {
      updatedTasks[editIndex] = {
        text: newTask,
        priority,
        dueDate,
        completed: tasks[editIndex].completed,
      };
      setEditIndex(null);
    } else {
      updatedTasks.push({
        text: newTask,
        priority,
        dueDate,
        completed: false,
      });
    }
    setTasks(updatedTasks);
    updateFirestoreTasks(user.uid, updatedTasks);
    setNewTask("");
    setPriority("low");
    setDueDate("");
  };

  // Delete Task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    updateFirestoreTasks(user.uid, updatedTasks);
  };

  // Toggle Task Completion
  const toggleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
    updateFirestoreTasks(user.uid, updatedTasks);
  };

  // Sort Tasks by Due Date
  const sortByDate = () => {
    const sortedTasks = [...tasks].sort((a, b) =>
      sortOrderDate === "asc"
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate)
    );
    setTasks(sortedTasks);
    setSortOrderDate(sortOrderDate === "asc" ? "desc" : "asc"); // Toggle the sort order
  };

  // Sort Tasks by Priority
  const sortByPriority = () => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sortedTasks = [...tasks].sort(
      (a, b) =>
        sortOrderPriority === "asc"
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority]
    );
    setTasks(sortedTasks);
    setSortOrderPriority(sortOrderPriority === "asc" ? "desc" : "asc"); // Toggle the sort order
  };

  // Add the clearAllTasks function
  const clearAllTasks = () => {
    setTasks([]); // Clear the tasks in state
    if (user) {
      updateFirestoreTasks(user.uid, []); // Update Firestore to clear tasks
    }
  };

  // Load User on Auth State Change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        syncTasks(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Login/Logout Button */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Your To-Do List</h1>
        {!user ? (
          <button
            onClick={loginWithGoogle}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Login with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>

      {/* Task Form */}
      {user && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task"
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addOrUpdateTask(); // Call the function to add or update the task
                }
              }}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <button
              onClick={addOrUpdateTask}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {editIndex !== null ? "Update Task" : "Add Task"}
            </button>
          </div>

          {/* Sorting Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={sortByDate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
            >
              Sort by Date
              {sortOrderDate === "asc" ? (
                <ChevronDownIcon className="h-5 w-5 ml-2" />
              ) : (
                <ChevronUpIcon className="h-5 w-5 ml-2" />
              )}
            </button>
            <button
              onClick={sortByPriority}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center"
            >
              Sort by Priority
              {sortOrderPriority === "asc" ? (
                <ChevronDownIcon className="h-5 w-5 ml-2" />
              ) : (
                <ChevronUpIcon className="h-5 w-5 ml-2" />
              )}
            </button>
            {/* Clear All Tasks Button */}
            <button
              onClick={clearAllTasks}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Clear All Tasks
            </button>
          </div>

          {/* Task List */}
          <div className="mt-6 space-y-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg shadow-md ${task.completed ? "bg-green-100 line-through text-gray-400" : ""
                  }`}
                onClick={() => toggleTaskCompletion(index)}
              >
                <span className="flex-1 cursor-pointer">{task.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteTask(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setNewTask(task.text);
                      setPriority(task.priority);
                      setDueDate(task.dueDate);
                      setEditIndex(index);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;