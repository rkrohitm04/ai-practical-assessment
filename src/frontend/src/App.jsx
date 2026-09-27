import React, { useState, useEffect } from 'react';
const API_BASE = "http://localhost:8000";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(3);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/users/`).then(r => r.json()).then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    let url = `${API_BASE}/tickets/?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;
    fetch(url).then(r => r.json()).then(setTickets).catch(() => setError("API Error"));
  }, [search, status]);

  const createTicket = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API_BASE}/tickets/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, createdBy: Number(activeUser) })
    });
    if (res.ok) { setTitle(""); setDesc(""); setTickets([await res.json(), ...tickets]); }
    else { const d = await res.json(); setError(d.detail || "Error"); }
  };

  const updateStatus = async (newStatus) => {
    setError("");
    const res = await fetch(`${API_BASE}/tickets/${selected.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) { 
      const updated = await res.json();
      setSelected(updated);
      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    } else {
      const d = await res.json();
      setError(d.detail || "Invalid transition");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/tickets/${selected.id}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: comment, createdBy: Number(activeUser) })
    });
    if (res.ok) {
      setComment("");
      const refreshed = await fetch(`${API_BASE}/tickets/${selected.id}`).then(r => r.json());
      setSelected(refreshed);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="flex" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h2>Support Tickets</h2>
        <div>
          User: <select value={activeUser} onChange={e => setActiveUser(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <button onClick={() => window.location.href=`${API_BASE}/tickets/export/${activeUser}`}>Export CSV</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>New Ticket</h3>
        <form onSubmit={createTicket}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" required />
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <div className="flex">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option><option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option><option value="Closed">Closed</option>
          </select>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}><td>{t.id}</td><td>{t.title}</td><td>{t.status}</td>
              <td><button onClick={() => {setSelected(t); setError("");}}>View</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card">
          <h3>{selected.title} ({selected.status})</h3>
          <p>{selected.description}</p>
          <div>
            <button onClick={() => updateStatus("In Progress")}>To In Progress</button>
            <button onClick={() => updateStatus("Resolved")}>To Resolved</button>
            <button onClick={() => updateStatus("Closed")}>To Closed</button>
            <button onClick={() => updateStatus("Cancelled")}>To Cancelled</button>
            <button onClick={() => setSelected(null)}>Close View</button>
          </div>
          <hr/>
          <h4>Comments</h4>
          {selected.comments?.map(c => <p key={c.id}><b>User {c.createdBy}:</b> {c.message}</p>)}
          <form onSubmit={addComment} className="flex">
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment" required />
            <button type="submit">Add</button>
          </form>
        </div>
      )}
    </div>
  );
}
