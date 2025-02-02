import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/solid";
import { auth, db, provider } from "./firebase";
import ReactDatePicker from "react-datepicker";
import { Timestamp } from "firebase/firestore";
import "react-datepicker/dist/react-datepicker.css";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Select Priority");
  const [dueDate, setDueDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [sortOrderDate, setSortOrderDate] = useState("asc");
  const [sortOrderPriority, setSortOrderPriority] = useState("asc");
  
  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

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
        const tasksFromDB = docSnap.data().tasks || [];
        const formattedTasks = tasksFromDB.map((task) => ({
          ...task,
          dueDate: task.dueDate ? task.dueDate.toDate() : null, // Convert Firestore Timestamp to Date
        }));
        setTasks(formattedTasks);
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
  // Add or Update Task
  const addOrUpdateTask = () => {
    if (!newTask) return;
    const updatedTasks = [...tasks];
    if (editIndex !== null) {
      updatedTasks[editIndex] = {
        text: newTask,
        priority,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null, // Convert to Firestore Timestamp
        completed: tasks[editIndex].completed,
      };
      setEditIndex(null);
    } else {
      updatedTasks.push({
        text: newTask,
        priority,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null, // Convert to Firestore Timestamp
        completed: false,
      });
    }
    updatedTasks.sort((a, b) => a.completed - b.completed);
    setTasks(updatedTasks);
    updateFirestoreTasks(user.uid, updatedTasks);
    setNewTask("");
    setPriority("Select Priority");
    setDueDate("");
  };

  // Delete Task
  const deleteTask = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    updateFirestoreTasks(user.uid, updatedTasks);
  };

  // Toggle Task Completion
  const toggleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    updatedTasks.sort((a, b) => a.completed - b.completed); // Keep the completed tasks at the end
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
    setSortOrderDate(sortOrderDate === "asc" ? "desc" : "asc");
  };


  const handleDateChange = (date) => {
    setDueDate(date);
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
    setSortOrderPriority(sortOrderPriority === "asc" ? "desc" : "asc");
  };

  // Clear All Tasks
  const clearAllTasks = () => {
    const confirmed = window.confirm("Are you sure you want to clear all tasks?");
    if (!confirmed) return;

    setTasks([]);
    if (user) {
      updateFirestoreTasks(user.uid, []);
    }
  };

  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s|$)/g;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        const formattedUrl = /^https?:\/\//.test(part) ? part : `http://${part}`;
        return (
          <a
            key={index}
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
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
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      {/* Login/Logout Section */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 text-center">
          Wrap-It-Up
        </h1>
        {!user ? (
          <button
            onClick={loginWithGoogle}
            className="block m-auto w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Login with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="block m-auto w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>

      {/* Task Form */}
      {user && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-4">
            {/* Task Input */}
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOrUpdateTask();
                }
              }}
              placeholder="Add a new task"
              className={`flex-1 px-4 py-2 border rounded-lg w-full sm:w-auto ${newTask ? "text-black" : "text-gray-400"}`}
            />

            {/* Priority and Due Date Inputs (for mobile: stacked, for desktop: inline) */}
            {/* Priority Dropdown */}
            {/* Priority Dropdown */}
            <div className="relative flex items-center sm:w-auto w-full">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`bg-white px-4 py-2 border rounded-lg w-full appearance-none sm:w-40 ${priority !== "Select Priority" ? "text-black" : "text-gray-400"}`}
              >
                <option value="Select Priority" disabled hidden>
                  Select Priority
                </option> {/* Hidden placeholder */}
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Chevron Icon */}
              <div className="absolute right-2 top-3">
                {sortOrderPriority === "asc" ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            <div className="relative">
              {/* Custom Date Picker on Phones */}
              <div className="sm:hidden grid">
                <ReactDatePicker
                  selected={dueDate}
                  onChange={handleDateChange}
                  placeholderText="Add a date"
                  className={`px-4 py-2 border rounded-lg w-full ${dueDate ? "text-black" : "text-gray-400"}`}
                />
              </div>

              {/* Native Date Input on Larger Screens */}
              <input
                type="date"
                value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className={`text-black px-4 py-2 border rounded-lg w-full appearance-none sm:w-auto sm:block hidden ${dueDate ? "text-black" : "text-gray-400"}`}
              />
            </div>

            {/* Add/Update Button */}
            <button
              onClick={addOrUpdateTask}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-full sm:w-auto"
            >
              {editIndex !== null ? "Update Task" : "Add Task"}
            </button>
          </div>
        </div>
      )}

      {user && tasks.length > 0 && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg mt-4 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
          {/* Sorting Buttons */}
          <div className="flex flex-wrap mt-4 w-full justify-between sm:justify-start gap-4 sm:gap-8">
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
          </div>

          {/* Tasks with Transitions */}
          <div className="mt-6 space-y-4">
            <TransitionGroup>
              {tasks.map((task, index) => (
                <CSSTransition
                  key={index}
                  timeout={300} // Duration of the animation
                  classNames="task" // Class name for animation styles
                >
                  <div
                    className={`mt-4 flex flex-wrap items-center justify-between p-4 rounded-lg shadow-md ${task.completed ? "bg-green-100 line-through text-gray-400" : ""
                      }`}
                    onClick={() => toggleTaskCompletion(index)} // Toggle completion on click
                  >
                    <button className="text-green-500 hover:text-green-700">
                      {task.completed ? (
                        <CheckCircleIcon className="h-5 w-5 mr-5" /> // Show checked circle if completed
                      ) : (
                        <ClockIcon className="h-5 w-5 mr-5 text-yellow-500" /> // Show empty circle if not completed
                      )}
                    </button>
                    <span className="flex-1 cursor-pointer break-all"
                    >
                      {renderTextWithLinks(task.text)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling task completion
                          deleteTask(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling task completion
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
                </CSSTransition>
              ))}

            </TransitionGroup>
          </div>

          {/* Clear All Tasks Button */}
          <button
            onClick={clearAllTasks}
            className="w-full bg-red-500 text-white py-2 rounded-lg mt-4 hover:bg-red-600 transition"
          >
            Clear All Tasks
          </button>
        </div>
      )
      }
    </div >
  );
};

export default App;