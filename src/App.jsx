import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('low');
  const [isPriorityAsc, setIsPriorityAsc] = useState(true);
  const [isDueDateAsc, setIsDueDateAsc] = useState(true);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else {
      // If no tasks are left, clear localStorage
      localStorage.removeItem('tasks');
    }
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (newTask.trim()) {
      if (editIndex !== null) {
        const updatedTasks = tasks.map((task, index) =>
          index === editIndex ? { ...task, text: newTask, dueDate, priority } : task
        );
        setTasks(updatedTasks);
        setEditIndex(null);
      } else {
        const updatedTasks = [
          ...tasks,
          { text: newTask, completed: false, dueDate, priority }
        ];
        setTasks(updatedTasks);
      }
      setNewTask('');
      setDueDate('');
      setPriority('low');
    } else {
      alert("Task cannot be empty!");
    }
  };

  const toggleTaskCompletion = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    // If tasks array becomes empty, remove tasks from localStorage
    if (updatedTasks.length === 0) {
      localStorage.removeItem('tasks');
    }
  };

  const clearAllTasks = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      setTasks([]);
      localStorage.removeItem('tasks'); // Ensure clearing localStorage when clearing all tasks
    }
  };

  const sortTasksByPriority = () => {
    const sortedTasks = [...tasks];
    const priorityOrder = ['low', 'medium', 'high'];
    sortedTasks.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority);
      const bIndex = priorityOrder.indexOf(b.priority);
      return isPriorityAsc ? aIndex - bIndex : bIndex - aIndex;
    });
    setTasks(sortedTasks);
    setIsPriorityAsc(!isPriorityAsc);
  };

  const sortTasksByDueDate = () => {
    const sortedTasks = [...tasks];
    sortedTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return isDueDateAsc ? dateA - dateB : dateB - dateA;
    });
    setTasks(sortedTasks);
    setIsDueDateAsc(!isDueDateAsc);
  };

  const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (regex.test(value) || value === '') {
      setDueDate(value);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col items-center px-4 py-8 transition-all`}>
      <button onClick={toggleTheme} className="absolute w-10 h-10 top-auto right-4 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700">
        {darkMode ? "🌙" : "🌞"}
      </button>
      <h1 className="text-4xl font-semibold mb-6 text-center">My To-Do List</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full max-w-4xl px-4 items-center justify-center">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="text-black px-4 py-2 border rounded-lg shadow-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'text-white' : 'bg-white text-black'}`}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm w-32 pl-6 pr-10 appearance-none bg-white text-black"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2224%22 height=%2224%22%3E%3Cpath d=%22M7 10l5 5 5-5z%22/%3E%3C/svg%3E")',
              backgroundPosition: 'right 10px center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button onClick={addOrUpdateTask} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition w-full sm:w-auto">
          {editIndex !== null ? 'Save Changes' : 'Add Task'}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-4 py-2 border rounded-lg shadow-sm w-full sm:w-72 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-4 mb-4 w-full justify-center">
        <button onClick={sortTasksByDueDate} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition w-auto">
          Sort by Due Date {isDueDateAsc ? '↑' : '↓'}
        </button>
        <button onClick={sortTasksByPriority} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition w-auto">
          Sort by Priority {isPriorityAsc ? '↑' : '↓'}
        </button>
        <button onClick={clearAllTasks} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition w-auto">
          Clear All Tasks
        </button>
      </div>

      <ul className="w-full max-w-4xl space-y-4">
        {filteredTasks.map((task, index) => (
          <li
            key={index}
            className={`flex justify-between items-center px-4 py-2 border-b rounded-lg transition-all ease-in-out ${task.completed
              ? 'bg-green-100 hover:bg-green-100 opacity-80 line-through text-gray-500'
              : 'bg-white hover:bg-gray-100'} `}
          >
            <div className="flex justify-between items-center w-full">
              <span
                onClick={() => toggleTaskCompletion(index)}
                className={`text-black cursor-pointer text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}
              >
                {task.text}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditIndex(index);
                    setNewTask(task.text);
                    setDueDate(task.dueDate);
                    setPriority(task.priority);
                  }}
                  className="text-yellow-500 hover:text-yellow-700 transition"
                  aria-label="Edit task"
                >
                  <PencilIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={() => deleteTask(index)}
                  className="text-red-500 hover:text-red-700 transition"
                  aria-label="Delete task"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
