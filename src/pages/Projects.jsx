import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";
import { getTasks, createTask, updateTask, deleteTask } from "../api";

function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast state
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");

  const showToast = (msg, type = "success") => {
      setToastMsg(msg);
      setToastType(type);
      setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const newTask = { title, description, priority, completed: false };
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setTasks([...tasks, { ...newTask, _id: tempId }]);
    setTitle("");
    setDescription("");
    
    try {
        const createdTask = await createTask(newTask);
        setTasks(prev => prev.map(t => t._id === tempId ? createdTask : t));
        showToast("Task created successfully!");
    } catch (err) {
        setTasks(prev => prev.filter(t => t._id !== tempId));
        showToast(err.message, "error");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
        const updated = await updateTask(task._id, { completed: !task.completed });
        setTasks(tasks.map(t => t._id === task._id ? updated : t));
        showToast("Task updated successfully!");
    } catch (err) {
        showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        try {
            await deleteTask(id);
            setTasks(tasks.filter(t => t._id !== id));
            showToast("Task deleted successfully!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container">
      <h1 className="page-title">Task Management</h1>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3>Add New Task</h3>
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px' }} />
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '8px' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
              </select>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Create Task</button>
          </form>
      </div>

      <div className="projects-grid">
        {tasks.map((task) => (
          <div className="project-card" key={task._id}>
            <span className="status" style={{ backgroundColor: task.completed ? '#4CAF50' : '#ff9800' }}>
              {task.completed ? 'Completed' : 'Pending'}
            </span>
            <h2>{task.title}</h2>
            <p>{task.description || "No description"}</p>
            <p>Priority: <strong>{task.priority}</strong></p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleToggleComplete(task)} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                    Mark {task.completed ? 'Pending' : 'Complete'}
                </button>
                <button onClick={() => handleDelete(task._id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none' }}>
                    Delete
                </button>
            </div>
          </div>
        ))}
      </div>

      <Toast message={toastMsg} type={toastType} />
    </div>
  );
}

export default Projects;