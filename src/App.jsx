// App.jsx
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';
import { getTasks, addTask, updateTask, deleteTask } from './firebase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('low');

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksFromFirestore = await getTasks();
      setTasks(tasksFromFirestore);
    };
    fetchTasks();
  }, []);

  const addOrUpdateTask = async () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        dueDate,
        priority,
      };

      if (editIndex !== null) {
        await updateTask(tasks[editIndex].id, task);
        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = task;
        setTasks(updatedTasks);
        setEditIndex(null);
      } else {
        await addTask(task);
        setTasks((prevTasks) => [...prevTasks, task]);
      }

      setNewTask('');
      setDueDate('');
      setPriority('low');
    } else {
      alert('Task cannot be empty!');
    }
  };

  const toggleTaskCompletion = async (index) => {
    const updatedTask = { ...tasks[index], completed: !tasks[index].completed };
    await updateTask(tasks[index].id, updatedTask);
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);
  };

  const deleteTaskHandler = async (index) => {
    await deleteTask(tasks[index].id);
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col items-center px-4 py-8 transition-all`}
    >
      <button onClick={toggleTheme} className="absolute w-10 h-10 top-auto right-4 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700">
        {darkMode ? '🌙' : '🌞'}
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

      <ul className="w-full max-w-4xl space-y-4">
        {filteredTasks.map((task, index) => (
          <li key={task.id} className={`flex justify-between items-center px-4 py-2 border-b rounded-lg transition-all ease-in-out ${task.completed ? 'bg-green-100 opacity-80 line-through text-gray-500' : 'bg-white hover:bg-gray-100'}`}>
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
                  onClick={() => deleteTaskHandler(index)}
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
