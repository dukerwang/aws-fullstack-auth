import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [userList, setUserList] = useState([]);

  // CHANGE THIS TO YOUR EC2 IP!
  const YOUR_EC2_IP = '3.17.64.55'; 
  const API_URL = `http://${YOUR_EC2_IP}:3001`;

  // --- READ: Fetch Users ---
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) { console.error("Error fetching users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- HANDLE SUBMIT (Login/Register) ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success && isRegistering) fetchUsers();
    } catch (error) { setMessage('API Error'); }
  };

  // --- UPDATE: Change Password ---
  const handleUpdate = async (id) => {
    const newPassword = window.prompt("Enter new password:");
    if (!newPassword) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) { alert('Update failed'); }
  };

  // --- DELETE: Remove User ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      fetchUsers(); // Refresh list
    } catch (error) { alert('Delete failed'); }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br/>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/>
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)}>
          Switch to {isRegistering ? 'Login' : 'Register'}
        </button>
        <p>{message}</p>

        <h3>User Management (CRUD):</h3>
        <ul>
          {userList.map(u => (
            <li key={u.id} style={{marginBottom: '10px'}}>
              {u.username} 
              <button onClick={() => handleUpdate(u.id)} style={{marginLeft: '10px'}}>Edit Password</button>
              <button onClick={() => handleDelete(u.id)} style={{marginLeft: '5px', color: 'red'}}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
