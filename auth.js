const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// In-memory storage of users (for demonstration purposes)
let users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('password123', 10) }
];

// GET route for login page
router.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - UBBload</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container my-5">
        <h2 class="text-center">Login to UBBload</h2>
        <form id="loginForm" method="POST" action="/api/login/json">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" name="username" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
        <div class="text-center mt-3">
          <a href="/signup" class="text-white">Don't have an account? Sign up here</a>
        </div>
      </div>
      <script>
        // Handle form submission via JavaScript to manage the localStorage and redirection
        const loginForm = document.getElementById('loginForm');
        loginForm.onsubmit = async (e) => {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const response = await fetch('/api/login/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
          });
          const data = await response.json();
          if (response.ok) {
            // Store username in localStorage
            localStorage.setItem('loggedIn', data.username);
            // Redirect to home page
            window.location.href = '/';
          } else {
            alert(data.message || 'Login failed');
          }
        };
      </script>
    </body>
    </html>
  `);
});

// POST route for login
router.post('/api/login/json', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Login failed' });
  }
});

// GET route for signup page
router.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signup - UBBload</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container my-5">
        <h2 class="text-center">Sign up for UBBload</h2>
        <form id="signupForm" method="POST" action="/api/signup/json">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" name="username" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-success w-100">Sign up</button>
        </form>
        <div class="text-center mt-3">
          <a href="/login" class="text-white">Already have an account? Login here</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// POST route for signup
router.post('/api/signup/json', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  users.push({ username, passwordHash: bcrypt.hashSync(password, 10) });
  res.json({ message: 'User created successfully', username });
});

// POST route to confirm password before uploading
router.post('/api/upload/confirm', (req, res) => {
  const { password, username } = req.body;
  
  const user = users.find(u => u.username === username);

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    res.json({ message: 'Password confirmed. You can proceed with the upload.' });
  } else {
    res.status(403).json({ message: 'Password incorrect. Access denied.' });
  }
});

module.exports = { router };
