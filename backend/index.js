const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

// --- 1. CREATE: Register ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  
  db.run(sql, [username, hashedPassword], function(err) {
    if (err) {
      if (err.errno === 19) return res.json({ success: false, message: 'Username taken.' });
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'User registered!' });
  });
});

// --- 2. READ: Login ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  
  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (match) res.json({ success: true, message: 'Login successful!' });
    else res.json({ success: false, message: 'Invalid credentials' });
  });
});

// --- 3. READ: Get All Users ---
app.get('/users', (req, res) => {
  db.all("SELECT id, username FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, users: rows });
  });
});

// --- 4. UPDATE: Change Password ---
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const sql = "UPDATE users SET password = ? WHERE id = ?";
  db.run(sql, [hashedPassword, id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Password updated successfully!' });
  });
});

// --- 5. DELETE: Remove User ---
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.run(sql, id, function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'User deleted successfully!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
