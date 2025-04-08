const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('password123', 10) }
];

router.post('/api/login/json', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Login failed' });
  }
});

router.post('/api/signup/json', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username taken' });
  }
  users.push({ username, passwordHash: bcrypt.hashSync(password, 10) });
  res.json({ message: 'User created', username });
});

module.exports = router;
