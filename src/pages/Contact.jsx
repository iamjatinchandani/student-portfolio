import { useState, useEffect } from "react";

function Contact() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch("http://localhost:5000/contacts");
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await fetch(`http://localhost:5000/contacts/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, message })
                });
                setEditingId(null);
            } else {
                await fetch("http://localhost:5000/contacts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, message })
                });
            }
            setName("");
            setMessage("");
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (msg) => {
        setName(msg.name);
        setMessage(msg.message);
        setEditingId(msg._id);
    };

    const handleDelete = async (id, msgName) => {
        if (window.confirm(`Delete the message from "${msgName}"?`)) {
            try {
                await fetch(`http://localhost:5000/contacts/${id}`, {
                    method: "DELETE"
                });
                fetchMessages();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "auto", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#4f46e5", marginBottom: "10px" }}>Contact Me</h1>
            <p style={{ color: "#444", marginBottom: "20px" }}>Send a message and it will be stored in MongoDB.</p>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "40px" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>Message</label>
                    <textarea 
                        rows="4" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #eab308" }}
                    />
                </div>
                <button type="submit" style={{ alignSelf: "flex-start", padding: "10px 25px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                    {editingId ? "Update" : "Send"}
                </button>
            </form>

            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ color: "#4f46e5", margin: 0 }}>Messages ({messages.length})</h2>
                    <button onClick={fetchMessages} style={{ padding: "5px 15px", cursor: "pointer", backgroundColor: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: "5px", fontWeight: "bold" }}>Refresh</button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {messages.map((msg) => (
                        <div key={msg._id} style={{ padding: "20px", backgroundColor: "#fdfdfd", border: "1px solid #eaeaea", borderRadius: "10px" }}>
                            <h4 style={{ margin: "0 0 5px 0", color: "#111", fontSize: "16px" }}>{msg.name}</h4>
                            <p style={{ margin: "0 0 10px 0", color: "#333" }}>{msg.message}</p>
                            <small style={{ color: "#888", display: "block", marginBottom: "15px" }}>{new Date(msg.createdAt).toLocaleString()}</small>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleEdit(msg)} style={{ padding: "5px 15px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer" }}>Edit</button>
                                <button onClick={() => handleDelete(msg._id, msg.name)} style={{ padding: "5px 15px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Contact;