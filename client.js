const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory data
const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('password123', 10) }, // Example user
];

// Handle POST request for login
app.post('/api/login/json', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Login failed. Invalid username or password.' });
  }
});

// Handle POST request for signup
app.post('/api/signup/json', (req, res) => {
  const { username, password } = req.body;
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  users.push({ username, passwordHash });

  res.json({ message: 'User successfully created', username });
});

// Serve the login page (GET)
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Page</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container">
        <div class="row justify-content-center align-items-center" style="height: 100vh;">
          <div class="col-4">
            <h3 class="text-center">Login</h3>
            <form id="loginForm">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>
            <p class="text-center mt-3">
              <a href="/signup" class="text-white">Don't have an account? Sign up here</a>
            </p>
          </div>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
      <script>
        document.getElementById('loginForm').addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent form submission
          
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          fetch('/api/login/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Login successful') {
              localStorage.setItem('loggedIn', data.username); // Store the username in localStorage
              window.location.href = '/dashboard'; // Redirect to dashboard or home page
            } else {
              alert('Login failed. Invalid username or password.');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login.');
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Serve the signup page (GET)
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signup Page</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark text-white">
      <div class="container">
        <div class="row justify-content-center align-items-center" style="height: 100vh;">
          <div class="col-4">
            <h3 class="text-center">Sign Up</h3>
            <form id="signupForm">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-primary">Sign Up</button>
              </div>
            </form>
            <p class="text-center mt-3">
              <a href="/login" class="text-white">Already have an account? Login here</a>
            </p>
          </div>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
      <script>
        document.getElementById('signupForm').addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent form submission
          
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          fetch('/api/signup/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'User successfully created') {
              alert('User successfully created, please log in.');
              window.location.href = '/login'; // Redirect to login page after signup
            } else {
              alert('Signup failed: ' + data.message);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during signup.');
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
