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
  const [title, setTitle] = useState("Fix urgent database indexing bug");
  const [description, setDescription] = useState(
    'Outline requirements and complete all deliverables for "Fix urgent database indexing bug". Validate functionality, conduct thorough testing, and document the final outcomes.'
  );
  const [priority, setPriority] = useState("high");
  const [assignedTo, setAssignedTo] = useState("");

  // AI Assistant State (Practical 13)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState({
    visible: true,
    engine: "Template Fallback Engine",
    suggestedPriority: "HIGH",
    note: "Fallback description inserted into the form below. (Configure GEMINI_API_KEY in backend .env to use live Gemini AI)."
  });

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

  const handleAutoGenerateAI = async () => {
    if (!title.trim()) {
      showToast("Please enter a task title first", "error");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("http://localhost:5000/tasks/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() })
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setDescription(data.description);
      setPriority(data.suggestedPriority ? data.suggestedPriority.toLowerCase() : "medium");
      setAiResult({
        visible: true,
        engine: data.engine || "Template Fallback Engine",
        suggestedPriority: (data.suggestedPriority || "high").toUpperCase(),
        note: data.note || "Fallback description inserted into the form below."
      });
      showToast("AI suggestion applied!");
    } catch {
      // Graceful fallback: offline template generator
      const lower = title.toLowerCase();
      const fallbackPri = lower.includes("urgent") || lower.includes("bug") || lower.includes("database") ? "high" : "medium";
      const fallbackDesc = `Outline requirements and complete all deliverables for "${title}". Validate functionality, conduct thorough testing, and document the final outcomes.`;
      setDescription(fallbackDesc);
      setPriority(fallbackPri);
      setAiResult({
        visible: true,
        engine: "Template Fallback Engine",
        suggestedPriority: fallbackPri.toUpperCase(),
        note: "Fallback description inserted into the form below. (Configure GEMINI_API_KEY in backend .env to use live Gemini AI)."
      });
      showToast("Template AI suggestion applied!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const newTask = {
      title,
      description,
      priority,
      assignedTo: assignedTo || "jatin.chandani@student.univ.edu",
      completed: false
    };

    const tempId = Date.now().toString();
    setTasks([...tasks, { ...newTask, _id: tempId }]);

    try {
      const createdTask = await createTask(newTask);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? createdTask : t)));
      showToast("Task created successfully!");
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(err.message, "error");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks(tasks.map((t) => (t._id === task._id ? updated : t)));
      showToast("Task updated successfully!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        setTasks(tasks.filter((t) => t._id !== id));
        showToast("Task deleted successfully!");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      {/* Add New Task Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          marginBottom: "35px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0"
        }}
      >
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "#4338ca",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px"
          }}
        >
          <span style={{ fontSize: "1.9rem" }}>➕</span> Add New Task
        </h2>

        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", color: "#1f2937", fontSize: "0.95rem" }}>
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Fix urgent database indexing bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
                outline: "none"
              }}
            />
          </div>

          {/* Practical 13 AI Assistant Card */}
          <div
            style={{
              backgroundColor: "#f0f7ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "14px 18px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "0.95rem" }}>
                  ✨ Practical 13: AI Assistant
                </span>
                <span
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    fontSize: "0.78rem",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontWeight: "600"
                  }}
                >
                  {aiResult.engine}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAutoGenerateAI}
                disabled={aiLoading}
                style={{
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "7px 18px",
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                ⚡ {aiLoading ? "Generating..." : "Auto-Generate Description with AI"}
              </button>
            </div>

            {/* AI Output Banner */}
            {aiResult.visible && (
              <div
                style={{
                  marginTop: "12px",
                  backgroundColor: "#fffbeb",
                  border: "1px dashed #f59e0b",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "0.86rem", color: "#374151" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span>🤖</span>
                      <strong style={{ color: "#1e3a8a" }}>Output from {aiResult.engine}:</strong>
                      <span
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "0.75rem",
                          fontWeight: "800"
                        }}
                      >
                        Suggested Priority: {aiResult.suggestedPriority}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0 24px", color: "#6b7280", fontSize: "0.82rem" }}>
                      {aiResult.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiResult({ ...aiResult, visible: false })}
                    style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#9ca3af" }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontWeight: "700", color: "#1f2937", fontSize: "0.95rem" }}>
                Description
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateAI}
                style={{ background: "none", border: "none", color: "#4f46e5", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}
              >
                ✨ Rewrite with AI
              </button>
            </div>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.6"
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", color: "#1f2937", fontSize: "0.95rem" }}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none"
              }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Assigned User */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", color: "#1f2937", fontSize: "0.95rem" }}>
              Assigned User / Email (for background event notification)
            </label>
            <input
              type="email"
              placeholder="e.g. jatin.chandani@student.univ.edu"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "25px",
                padding: "12px 28px",
                fontSize: "0.95rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div className="projects-grid">
        {tasks.map((task) => (
          <div className="project-card" key={task._id}>
            <span
              className="status"
              style={{
                backgroundColor: task.completed ? "#10b981" : "#f59e0b",
                alignSelf: "flex-start",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                color: "#fff",
                fontWeight: "700"
              }}
            >
              {task.completed ? "Completed" : "Pending"}
            </span>
            <h2 style={{ fontSize: "1.2rem", margin: "10px 0" }}>{task.title}</h2>
            <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: "1.6" }}>
              {task.description || "No description"}
            </p>
            <p style={{ fontSize: "0.88rem", marginTop: "10px" }}>
              Priority: <strong style={{ color: "#2563eb", textTransform: "capitalize" }}>{task.priority}</strong>
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={() => handleToggleComplete(task)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Mark {task.completed ? "Pending" : "Complete"}
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
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
