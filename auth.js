const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');  // Used to generate random verification codes
const nodemailer = require('nodemailer');  // Nodemailer module
const router = express.Router();

// In-memory storage of users (for demonstration purposes)
let users = [
  { username: 'admin', email: 'admin@example.com', passwordHash: bcrypt.hashSync('password123', 10), isVerified: true }
];

// Create a transporter for sending emails (using Gmail in this example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hi1992@yogirt.com',  
    pass: 'hi1992'    
  }
});

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
          localStorage.setItem('password', password);
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
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email address.' });
    }
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
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" name="email" required>
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
  const { username, email, password } = req.body;

  // Check if the username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Hash the password and store the new user with email and verification status
  const passwordHash = bcrypt.hashSync(password, 10);
  const verificationCode = crypto.randomBytes(6).toString('hex'); // Generate a random 6-digit code

  users.push({
    username,
    email,
    passwordHash,
    isVerified: false, // Email needs to be verified
    verificationCode
  });

  // Send verification email
  const mailOptions = {
    from: 'hi1992@yogirt.com',  // Your Gmail address
    to: email,
    subject: 'Email Verification for UBBload',
    html: `
      <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
      <p><a href="https://ubbload.onrender.com/verify-email/${verificationCode}">Verify Email</a></p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending verification email' });
    }
    console.log('Verification email sent:', info.response);
  });

  // Redirect to the login page after signup
  res.redirect('/login');
});

// GET route for email verification
router.get('/verify-email/:code', (req, res) => {
  const { code } = req.params;
  const user = users.find(u => u.verificationCode === code);

  if (user) {
    user.isVerified = true;
    user.verificationCode = null; // Clear the code after verification
    return res.send('Email verified successfully! You can now log in.');
  } else {
    return res.status(400).send('Invalid or expired verification code.');
  }
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
